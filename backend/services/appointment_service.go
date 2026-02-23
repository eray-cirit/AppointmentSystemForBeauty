package services

import (
	"errors"
	"fmt"
	"time"

	"github.com/eray-cirit/ciryt-backend/models"
	"github.com/eray-cirit/ciryt-backend/repositories"
)

type AppointmentService struct {
	appointmentRepo *repositories.AppointmentRepository
	serviceRepo     *repositories.ServiceRepository
	businessRepo    *repositories.BusinessRepository
}

func NewAppointmentService() *AppointmentService {
	return &AppointmentService{
		appointmentRepo: repositories.NewAppointmentRepository(),
		serviceRepo:     repositories.NewServiceRepository(),
		businessRepo:    repositories.NewBusinessRepository(),
	}
}

// Randevu oluştur
func (s *AppointmentService) CreateAppointment(userID uint, req models.CreateAppointmentRequest) (*models.Appointment, error) {
	// İşletme kontrolü
	business, err := s.businessRepo.FindByID(req.BusinessID)
	if err != nil {
		return nil, errors.New("işletme bulunamadı")
	}
	if !business.IsActive {
		return nil, errors.New("bu işletme aktif değil")
	}

	// Hizmet kontrolü
	service, err := s.serviceRepo.FindByID(req.ServiceID)
	if err != nil {
		return nil, errors.New("hizmet bulunamadı")
	}
	if service.BusinessID != req.BusinessID {
		return nil, errors.New("bu hizmet bu işletmeye ait değil")
	}

	// Tarih parse
	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		return nil, errors.New("geçersiz tarih formatı (YYYY-MM-DD)")
	}

	// Geçmiş tarih kontrolü
	today := time.Now().Truncate(24 * time.Hour)
	if date.Before(today) {
		return nil, errors.New("geçmiş tarihe randevu alınamaz")
	}

	// Bitiş saati hesapla
	endTime, err := calculateEndTime(req.StartTime, service.Duration)
	if err != nil {
		return nil, errors.New("geçersiz saat formatı (HH:MM)")
	}

	// Çakışma kontrolü
	if s.appointmentRepo.HasConflict(req.BusinessID, date, req.StartTime, endTime, 0) {
		return nil, errors.New("bu saat diliminde başka bir randevu var")
	}

	appointment := &models.Appointment{
		UserID:     userID,
		BusinessID: req.BusinessID,
		ServiceID:  req.ServiceID,
		Date:       date,
		StartTime:  req.StartTime,
		EndTime:    endTime,
		Status:     models.AppointmentStatusPending,
		Note:       req.Note,
		Price:      service.Price,
	}

	if err := s.appointmentRepo.Create(appointment); err != nil {
		return nil, errors.New("randevu oluşturulurken hata oluştu")
	}

	// İlişkileri yükle
	return s.appointmentRepo.FindByID(appointment.ID)
}

// Randevu durumu güncelle
func (s *AppointmentService) UpdateStatus(appointmentID, userID uint, role, status string) (*models.Appointment, error) {
	appointment, err := s.appointmentRepo.FindByID(appointmentID)
	if err != nil {
		return nil, errors.New("randevu bulunamadı")
	}

	// Yetki kontrolü: kullanıcı kendi randevusunu iptal edebilir, işletme sahibi tüm durumları değiştirebilir
	if role != "admin" {
		business, _ := s.businessRepo.FindByID(appointment.BusinessID)
		isOwner := business != nil && business.OwnerID == userID
		isUser := appointment.UserID == userID

		if !isOwner && !isUser {
			return nil, errors.New("bu randevu üzerinde yetkiniz yok")
		}

		// Kullanıcı sadece iptal edebilir
		if isUser && !isOwner && status != models.AppointmentStatusCancelled {
			return nil, errors.New("sadece randevunuzu iptal edebilirsiniz")
		}
	}

	// Durum geçiş kontrolü
	if !isValidTransition(appointment.Status, status) {
		return nil, fmt.Errorf("'%s' durumundan '%s' durumuna geçiş yapılamaz", appointment.Status, status)
	}

	appointment.Status = status
	if err := s.appointmentRepo.Update(appointment); err != nil {
		return nil, errors.New("randevu güncellenirken hata oluştu")
	}

	return appointment, nil
}

// Kullanıcının randevuları
func (s *AppointmentService) GetUserAppointments(userID uint) ([]models.Appointment, error) {
	return s.appointmentRepo.FindByUserID(userID)
}

// Randevu detayı
func (s *AppointmentService) GetAppointmentByID(id uint) (*models.Appointment, error) {
	return s.appointmentRepo.FindByID(id)
}

// Filtrelenmiş randevu listesi
func (s *AppointmentService) GetAppointments(filter models.AppointmentFilter) ([]models.Appointment, int64, error) {
	return s.appointmentRepo.FindWithFilter(filter)
}

// Bitiş saati hesapla
func calculateEndTime(startTime string, durationMinutes int) (string, error) {
	t, err := time.Parse("15:04", startTime)
	if err != nil {
		return "", err
	}
	end := t.Add(time.Duration(durationMinutes) * time.Minute)
	return end.Format("15:04"), nil
}

// Geçerli durum geçişleri
func isValidTransition(from, to string) bool {
	transitions := map[string][]string{
		models.AppointmentStatusPending:   {models.AppointmentStatusConfirmed, models.AppointmentStatusCancelled},
		models.AppointmentStatusConfirmed: {models.AppointmentStatusCompleted, models.AppointmentStatusCancelled, models.AppointmentStatusNoShow},
	}

	allowed, exists := transitions[from]
	if !exists {
		return false
	}
	for _, s := range allowed {
		if s == to {
			return true
		}
	}
	return false
}
