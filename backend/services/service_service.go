package services

import (
	"errors"

	"github.com/eray-cirit/ciryt-backend/models"
	"github.com/eray-cirit/ciryt-backend/repositories"
)

type ServiceService struct {
	serviceRepo  *repositories.ServiceRepository
	businessRepo *repositories.BusinessRepository
}

func NewServiceService() *ServiceService {
	return &ServiceService{
		serviceRepo:  repositories.NewServiceRepository(),
		businessRepo: repositories.NewBusinessRepository(),
	}
}

// İşletmenin hizmetlerini getir
func (s *ServiceService) GetServicesByBusiness(businessID uint) ([]models.Service, error) {
	return s.serviceRepo.FindByBusinessID(businessID)
}

// Hizmet oluştur (sadece işletme sahibi)
func (s *ServiceService) CreateService(ownerID, businessID uint, req models.CreateServiceRequest) (*models.Service, error) {
	business, err := s.businessRepo.FindByID(businessID)
	if err != nil {
		return nil, errors.New("işletme bulunamadı")
	}
	if business.OwnerID != ownerID {
		return nil, errors.New("bu işletmeye hizmet ekleme yetkiniz yok")
	}

	service := &models.Service{
		BusinessID:  businessID,
		Name:        req.Name,
		Description: req.Description,
		Duration:    req.Duration,
		Price:       req.Price,
		Gender:      req.Gender,
		IsActive:    true,
	}

	if err := s.serviceRepo.Create(service); err != nil {
		return nil, errors.New("hizmet oluşturulurken hata oluştu")
	}

	return service, nil
}

// Hizmet güncelle
func (s *ServiceService) UpdateService(ownerID, serviceID uint, req models.UpdateServiceRequest) (*models.Service, error) {
	service, err := s.serviceRepo.FindByID(serviceID)
	if err != nil {
		return nil, errors.New("hizmet bulunamadı")
	}

	business, _ := s.businessRepo.FindByID(service.BusinessID)
	if business == nil || business.OwnerID != ownerID {
		return nil, errors.New("bu hizmeti düzenleme yetkiniz yok")
	}

	if req.Name != "" {
		service.Name = req.Name
	}
	if req.Description != "" {
		service.Description = req.Description
	}
	if req.Duration > 0 {
		service.Duration = req.Duration
	}
	if req.Price > 0 {
		service.Price = req.Price
	}
	if req.Gender != "" {
		service.Gender = req.Gender
	}
	if req.IsActive != nil {
		service.IsActive = *req.IsActive
	}

	if err := s.serviceRepo.Update(service); err != nil {
		return nil, errors.New("güncelleme başarısız")
	}

	return service, nil
}

// Hizmet sil
func (s *ServiceService) DeleteService(ownerID, serviceID uint) error {
	service, err := s.serviceRepo.FindByID(serviceID)
	if err != nil {
		return errors.New("hizmet bulunamadı")
	}

	business, _ := s.businessRepo.FindByID(service.BusinessID)
	if business == nil || business.OwnerID != ownerID {
		return errors.New("bu hizmeti silme yetkiniz yok")
	}

	return s.serviceRepo.Delete(serviceID)
}
