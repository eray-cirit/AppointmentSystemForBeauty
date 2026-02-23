package repositories

import (
	"github.com/eray-cirit/ciryt-backend/database"
	"github.com/eray-cirit/ciryt-backend/models"
)

type ServiceRepository struct{}

func NewServiceRepository() *ServiceRepository {
	return &ServiceRepository{}
}

// İşletmenin hizmetlerini getir
func (r *ServiceRepository) FindByBusinessID(businessID uint) ([]models.Service, error) {
	var services []models.Service
	result := database.DB.Where("business_id = ? AND is_active = ?", businessID, true).
		Order("sort_order ASC, name ASC").Find(&services)
	return services, result.Error
}

// ID ile hizmet bul
func (r *ServiceRepository) FindByID(id uint) (*models.Service, error) {
	var service models.Service
	result := database.DB.First(&service, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &service, nil
}

// Hizmet oluştur
func (r *ServiceRepository) Create(service *models.Service) error {
	return database.DB.Create(service).Error
}

// Hizmet güncelle
func (r *ServiceRepository) Update(service *models.Service) error {
	return database.DB.Save(service).Error
}

// Hizmet sil
func (r *ServiceRepository) Delete(id uint) error {
	return database.DB.Delete(&models.Service{}, id).Error
}
