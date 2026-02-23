package repositories

import (
	"fmt"
	"math"

	"github.com/eray-cirit/ciryt-backend/database"
	"github.com/eray-cirit/ciryt-backend/models"
)

type BusinessRepository struct{}

func NewBusinessRepository() *BusinessRepository {
	return &BusinessRepository{}
}

// ID ile işletme bul
func (r *BusinessRepository) FindByID(id uint) (*models.Business, error) {
	var business models.Business
	result := database.DB.Preload("Owner").First(&business, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &business, nil
}

// İşletme oluştur
func (r *BusinessRepository) Create(business *models.Business) error {
	return database.DB.Create(business).Error
}

// İşletme güncelle
func (r *BusinessRepository) Update(business *models.Business) error {
	return database.DB.Save(business).Error
}

// İşletme sil
func (r *BusinessRepository) Delete(id uint) error {
	return database.DB.Delete(&models.Business{}, id).Error
}

// Filtrelenmiş işletme listesi
func (r *BusinessRepository) FindWithFilter(filter models.BusinessFilter) ([]models.Business, int64, error) {
	var businesses []models.Business
	var total int64

	query := database.DB.Model(&models.Business{}).Where("is_active = ?", true)

	// Filtreler
	if filter.City != "" {
		query = query.Where("city = ?", filter.City)
	}
	if filter.Gender != "" {
		query = query.Where("gender = ? OR gender = 'unisex'", filter.Gender)
	}

	// Toplam sayı
	query.Count(&total)

	// Konum bazlı sıralama (Haversine formülü)
	if filter.Lat != 0 && filter.Lng != 0 {
		haversine := fmt.Sprintf(
			"(6371 * acos(cos(radians(%f)) * cos(radians(lat)) * cos(radians(lng) - radians(%f)) + sin(radians(%f)) * sin(radians(lat))))",
			filter.Lat, filter.Lng, filter.Lat,
		)

		if filter.Radius > 0 {
			query = query.Where(haversine+" < ?", filter.Radius)
		}

		query = query.Order(haversine + " ASC")
	} else {
		query = query.Order("rating DESC")
	}

	// Pagination
	page := filter.Page
	limit := filter.Limit
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 12
	}
	offset := (page - 1) * limit

	result := query.Offset(offset).Limit(limit).Find(&businesses)

	// Distance hesapla (response için)
	if filter.Lat != 0 && filter.Lng != 0 {
		for i := range businesses {
			businesses[i].Rating = roundTo(businesses[i].Rating, 1)
		}
	}

	return businesses, total, result.Error
}

// Owner'ın işletmelerini bul
func (r *BusinessRepository) FindByOwnerID(ownerID uint) ([]models.Business, error) {
	var businesses []models.Business
	result := database.DB.Where("owner_id = ?", ownerID).Find(&businesses)
	return businesses, result.Error
}

func roundTo(val float64, decimals int) float64 {
	pow := math.Pow(10, float64(decimals))
	return math.Round(val*pow) / pow
}
