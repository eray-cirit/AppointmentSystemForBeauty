package services

import (
	"errors"

	"github.com/eray-cirit/ciryt-backend/models"
	"github.com/eray-cirit/ciryt-backend/repositories"
)

type UserService struct {
	userRepo *repositories.UserRepository
}

func NewUserService() *UserService {
	return &UserService{
		userRepo: repositories.NewUserRepository(),
	}
}

// Tüm kullanıcıları getir
func (s *UserService) GetAllUsers() ([]models.User, error) {
	return s.userRepo.FindAll()
}

// ID ile kullanıcı getir
func (s *UserService) GetUserByID(id uint) (*models.User, error) {
	user, err := s.userRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("kullanıcı bulunamadı")
	}
	return user, nil
}

// Profil güncelle
func (s *UserService) UpdateProfile(id uint, req models.UpdateUserRequest) (*models.User, error) {
	user, err := s.userRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("kullanıcı bulunamadı")
	}

	if req.FirstName != "" {
		user.FirstName = req.FirstName
	}
	if req.LastName != "" {
		user.LastName = req.LastName
	}
	if req.Phone != "" {
		user.Phone = req.Phone
	}
	if req.Gender != "" {
		user.Gender = req.Gender
	}

	if err := s.userRepo.Update(user); err != nil {
		return nil, errors.New("güncelleme başarısız")
	}

	return user, nil
}

// Kullanıcı sil
func (s *UserService) DeleteUser(id uint) error {
	_, err := s.userRepo.FindByID(id)
	if err != nil {
		return errors.New("kullanıcı bulunamadı")
	}
	return s.userRepo.Delete(id)
}
