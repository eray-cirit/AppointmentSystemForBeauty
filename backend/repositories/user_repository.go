package repositories

import (
	"github.com/eray-cirit/ciryt-backend/database"
	"github.com/eray-cirit/ciryt-backend/models"
)

type UserRepository struct{}

func NewUserRepository() *UserRepository {
	return &UserRepository{}
}

// Email ile kullanıcı bul
func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
	var user models.User
	result := database.DB.Where("email = ?", email).First(&user)
	if result.Error != nil {
		return nil, result.Error
	}
	return &user, nil
}

// ID ile kullanıcı bul
func (r *UserRepository) FindByID(id uint) (*models.User, error) {
	var user models.User
	result := database.DB.First(&user, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &user, nil
}

// Kullanıcı oluştur
func (r *UserRepository) Create(user *models.User) error {
	return database.DB.Create(user).Error
}

// Kullanıcı güncelle
func (r *UserRepository) Update(user *models.User) error {
	return database.DB.Save(user).Error
}

// Kullanıcı sil
func (r *UserRepository) Delete(id uint) error {
	return database.DB.Delete(&models.User{}, id).Error
}

// Tüm kullanıcıları getir
func (r *UserRepository) FindAll() ([]models.User, error) {
	var users []models.User
	result := database.DB.Order("created_at DESC").Find(&users)
	return users, result.Error
}

// Email var mı kontrolü
func (r *UserRepository) ExistsByEmail(email string) bool {
	var count int64
	database.DB.Model(&models.User{}).Where("email = ?", email).Count(&count)
	return count > 0
}
