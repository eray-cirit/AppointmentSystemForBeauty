package repositories

import (
	"time"

	"github.com/eray-cirit/ciryt-backend/database"
	"github.com/eray-cirit/ciryt-backend/models"
)

type AppointmentRepository struct{}

func NewAppointmentRepository() *AppointmentRepository {
	return &AppointmentRepository{}
}

// ID ile randevu bul (ilişkilerle birlikte)
func (r *AppointmentRepository) FindByID(id uint) (*models.Appointment, error) {
	var appointment models.Appointment
	result := database.DB.Preload("User").Preload("Business").Preload("Service").First(&appointment, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &appointment, nil
}

// Randevu oluştur
func (r *AppointmentRepository) Create(appointment *models.Appointment) error {
	return database.DB.Create(appointment).Error
}

// Randevu güncelle
func (r *AppointmentRepository) Update(appointment *models.Appointment) error {
	return database.DB.Save(appointment).Error
}

// Filtrelenmiş randevu listesi
func (r *AppointmentRepository) FindWithFilter(filter models.AppointmentFilter) ([]models.Appointment, int64, error) {
	var appointments []models.Appointment
	var total int64

	query := database.DB.Model(&models.Appointment{})

	if filter.UserID != 0 {
		query = query.Where("user_id = ?", filter.UserID)
	}
	if filter.BusinessID != 0 {
		query = query.Where("business_id = ?", filter.BusinessID)
	}
	if filter.Status != "" {
		query = query.Where("status = ?", filter.Status)
	}
	if filter.DateFrom != "" {
		from, err := time.Parse("2006-01-02", filter.DateFrom)
		if err == nil {
			query = query.Where("date >= ?", from)
		}
	}
	if filter.DateTo != "" {
		to, err := time.Parse("2006-01-02", filter.DateTo)
		if err == nil {
			query = query.Where("date <= ?", to)
		}
	}

	query.Count(&total)

	// Pagination
	page := filter.Page
	limit := filter.Limit
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 20
	}
	offset := (page - 1) * limit

	result := query.Preload("User").Preload("Business").Preload("Service").
		Order("date ASC, start_time ASC").
		Offset(offset).Limit(limit).
		Find(&appointments)

	return appointments, total, result.Error
}

// Çakışma kontrolü — aynı işletmede aynı tarih/saat
func (r *AppointmentRepository) HasConflict(businessID uint, date time.Time, startTime, endTime string, excludeID uint) bool {
	var count int64
	query := database.DB.Model(&models.Appointment{}).
		Where("business_id = ? AND date = ? AND status NOT IN (?, ?)",
			businessID, date, models.AppointmentStatusCancelled, models.AppointmentStatusNoShow).
		Where("(start_time < ? AND end_time > ?)", endTime, startTime)

	if excludeID > 0 {
		query = query.Where("id != ?", excludeID)
	}

	query.Count(&count)
	return count > 0
}

// Kullanıcının randevularını getir
func (r *AppointmentRepository) FindByUserID(userID uint) ([]models.Appointment, error) {
	var appointments []models.Appointment
	result := database.DB.Preload("Business").Preload("Service").
		Where("user_id = ?", userID).
		Order("date DESC, start_time DESC").
		Find(&appointments)
	return appointments, result.Error
}
