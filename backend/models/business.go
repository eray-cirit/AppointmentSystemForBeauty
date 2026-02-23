package models

import "time"

type Business struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	OwnerID     uint      `gorm:"index" json:"owner_id"`
	Owner       User      `gorm:"foreignKey:OwnerID" json:"owner"`
	Name        string    `gorm:"not null;size:255" json:"name"`
	Slug        string    `gorm:"uniqueIndex;size:255" json:"slug"`
	Description string    `gorm:"type:text" json:"description,omitempty"`
	Gender      string    `gorm:"size:10" json:"gender"` // "male" | "female" | "unisex"
	City        string    `gorm:"not null;size:100;index" json:"city"`
	District    string    `gorm:"size:100" json:"district,omitempty"`
	Address     string    `gorm:"type:text" json:"address,omitempty"`
	Phone       string    `gorm:"size:20" json:"phone,omitempty"`
	Lat         float64   `gorm:"type:decimal(10,7)" json:"lat,omitempty"`
	Lng         float64   `gorm:"type:decimal(10,7)" json:"lng,omitempty"`
	Rating      float64   `gorm:"type:decimal(2,1);default:0" json:"rating"`
	ReviewCount int       `gorm:"default:0" json:"review_count"`
	IsVerified  bool      `gorm:"default:false" json:"is_verified"`
	IsActive    bool      `gorm:"default:true" json:"is_active"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

// İşletme oluşturma DTO
type CreateBusinessRequest struct {
	Name        string  `json:"name" binding:"required"`
	Description string  `json:"description"`
	Gender      string  `json:"gender" binding:"required,oneof=male female unisex"`
	City        string  `json:"city" binding:"required"`
	District    string  `json:"district"`
	Address     string  `json:"address"`
	Phone       string  `json:"phone"`
	Lat         float64 `json:"lat"`
	Lng         float64 `json:"lng"`
}

// İşletme güncelleme DTO
type UpdateBusinessRequest struct {
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Gender      string  `json:"gender" binding:"omitempty,oneof=male female unisex"`
	City        string  `json:"city"`
	District    string  `json:"district"`
	Address     string  `json:"address"`
	Phone       string  `json:"phone"`
	Lat         float64 `json:"lat"`
	Lng         float64 `json:"lng"`
}

// İşletme listeleme filtresi
type BusinessFilter struct {
	City   string  `form:"city"`
	Gender string  `form:"gender"`
	Lat    float64 `form:"lat"`
	Lng    float64 `form:"lng"`
	Radius float64 `form:"radius"` // km
	Page   int     `form:"page"`
	Limit  int     `form:"limit"`
}
