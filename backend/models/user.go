package models

import "time"

type User struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	Email         string    `gorm:"uniqueIndex;not null;size:255" json:"email"`
	PasswordHash  string    `gorm:"not null;size:255" json:"-"` // JSON'da gizle
	FirstName     string    `gorm:"not null;size:100" json:"first_name"`
	LastName      string    `gorm:"not null;size:100" json:"last_name"`
	Gender        string    `gorm:"not null;size:10" json:"gender"` // "male" | "female"
	Role          string    `gorm:"default:user;size:20" json:"role"`
	Phone         string    `gorm:"size:20" json:"phone,omitempty"`
	EmailVerified bool      `gorm:"default:false" json:"email_verified"`
	CreatedAt     time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

// Register isteği için DTO
type RegisterRequest struct {
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=6"`
	FirstName string `json:"first_name" binding:"required"`
	LastName  string `json:"last_name" binding:"required"`
	Gender    string `json:"gender" binding:"required,oneof=male female"`
}

// Login isteği için DTO
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Login response
type AuthResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	User         User   `json:"user"`
}

// Profil güncelleme DTO
type UpdateUserRequest struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Phone     string `json:"phone"`
	Gender    string `json:"gender" binding:"omitempty,oneof=male female"`
}
