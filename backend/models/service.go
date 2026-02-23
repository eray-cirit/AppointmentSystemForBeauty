package models

import "time"

// İşletmenin sunduğu hizmet (saç kesimi, sakal, manikür vb.)
type Service struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	BusinessID  uint      `gorm:"index;not null" json:"business_id"`
	Business    Business  `gorm:"foreignKey:BusinessID" json:"business,omitempty"`
	Name        string    `gorm:"not null;size:255" json:"name"`
	Description string    `gorm:"type:text" json:"description,omitempty"`
	Duration    int       `gorm:"not null" json:"duration"` // dakika cinsinden
	Price       float64   `gorm:"type:decimal(10,2);not null" json:"price"`
	Gender      string    `gorm:"size:10" json:"gender"` // "male" | "female" | "unisex"
	IsActive    bool      `gorm:"default:true" json:"is_active"`
	SortOrder   int       `gorm:"default:0" json:"sort_order"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

// Hizmet oluşturma DTO
type CreateServiceRequest struct {
	Name        string  `json:"name" binding:"required"`
	Description string  `json:"description"`
	Duration    int     `json:"duration" binding:"required,min=5,max=480"`
	Price       float64 `json:"price" binding:"required,min=0"`
	Gender      string  `json:"gender" binding:"required,oneof=male female unisex"`
}

// Hizmet güncelleme DTO
type UpdateServiceRequest struct {
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Duration    int     `json:"duration" binding:"omitempty,min=5,max=480"`
	Price       float64 `json:"price" binding:"omitempty,min=0"`
	Gender      string  `json:"gender" binding:"omitempty,oneof=male female unisex"`
	IsActive    *bool   `json:"is_active"`
}
