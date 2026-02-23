package services

import (
	"errors"
	"fmt"
	"strings"

	"github.com/eray-cirit/ciryt-backend/models"
	"github.com/eray-cirit/ciryt-backend/repositories"
)

type BusinessService struct {
	businessRepo *repositories.BusinessRepository
}

func NewBusinessService() *BusinessService {
	return &BusinessService{
		businessRepo: repositories.NewBusinessRepository(),
	}
}

// İşletme listele
func (s *BusinessService) GetBusinesses(filter models.BusinessFilter) ([]models.Business, int64, error) {
	return s.businessRepo.FindWithFilter(filter)
}

// İşletme detayı
func (s *BusinessService) GetBusinessByID(id uint) (*models.Business, error) {
	business, err := s.businessRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("işletme bulunamadı")
	}
	return business, nil
}

// İşletme oluştur
func (s *BusinessService) CreateBusiness(ownerID uint, req models.CreateBusinessRequest) (*models.Business, error) {
	slug := generateSlug(req.Name)

	business := &models.Business{
		OwnerID:     ownerID,
		Name:        req.Name,
		Slug:        slug,
		Description: req.Description,
		Gender:      req.Gender,
		City:        req.City,
		District:    req.District,
		Address:     req.Address,
		Phone:       req.Phone,
		Lat:         req.Lat,
		Lng:         req.Lng,
		IsActive:    true,
	}

	if err := s.businessRepo.Create(business); err != nil {
		return nil, errors.New("işletme oluşturulurken hata oluştu")
	}

	return business, nil
}

// İşletme güncelle (sadece owner)
func (s *BusinessService) UpdateBusiness(id, ownerID uint, req models.UpdateBusinessRequest) (*models.Business, error) {
	business, err := s.businessRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("işletme bulunamadı")
	}

	if business.OwnerID != ownerID {
		return nil, errors.New("bu işletmeyi düzenleme yetkiniz yok")
	}

	if req.Name != "" {
		business.Name = req.Name
		business.Slug = generateSlug(req.Name)
	}
	if req.Description != "" {
		business.Description = req.Description
	}
	if req.Gender != "" {
		business.Gender = req.Gender
	}
	if req.City != "" {
		business.City = req.City
	}
	if req.District != "" {
		business.District = req.District
	}
	if req.Address != "" {
		business.Address = req.Address
	}
	if req.Phone != "" {
		business.Phone = req.Phone
	}
	if req.Lat != 0 {
		business.Lat = req.Lat
	}
	if req.Lng != 0 {
		business.Lng = req.Lng
	}

	if err := s.businessRepo.Update(business); err != nil {
		return nil, errors.New("güncelleme başarısız")
	}

	return business, nil
}

// İşletme sil (owner veya admin)
func (s *BusinessService) DeleteBusiness(id, userID uint, role string) error {
	business, err := s.businessRepo.FindByID(id)
	if err != nil {
		return errors.New("işletme bulunamadı")
	}

	if business.OwnerID != userID && role != "admin" {
		return errors.New("bu işletmeyi silme yetkiniz yok")
	}

	return s.businessRepo.Delete(id)
}

// Basit slug oluşturucu
func generateSlug(name string) string {
	slug := strings.ToLower(name)
	slug = strings.ReplaceAll(slug, " ", "-")
	slug = strings.ReplaceAll(slug, "ş", "s")
	slug = strings.ReplaceAll(slug, "ç", "c")
	slug = strings.ReplaceAll(slug, "ğ", "g")
	slug = strings.ReplaceAll(slug, "ı", "i")
	slug = strings.ReplaceAll(slug, "ö", "o")
	slug = strings.ReplaceAll(slug, "ü", "u")
	return fmt.Sprintf("%s-%d", slug, len(name))
}
