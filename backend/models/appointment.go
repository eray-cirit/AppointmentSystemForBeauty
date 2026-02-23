package models

import "time"

// Randevu durumları
const (
	AppointmentStatusPending   = "pending"   // Onay bekliyor
	AppointmentStatusConfirmed = "confirmed" // Onaylandı
	AppointmentStatusCancelled = "cancelled" // İptal edildi
	AppointmentStatusCompleted = "completed" // Tamamlandı
	AppointmentStatusNoShow    = "no_show"   // Gelmedi
)

type Appointment struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	UserID     uint      `gorm:"index;not null" json:"user_id"`
	User       User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	BusinessID uint      `gorm:"index;not null" json:"business_id"`
	Business   Business  `gorm:"foreignKey:BusinessID" json:"business,omitempty"`
	ServiceID  uint      `gorm:"index;not null" json:"service_id"`
	Service    Service   `gorm:"foreignKey:ServiceID" json:"service,omitempty"`
	Date       time.Time `gorm:"type:date;not null;index" json:"date"`        // Randevu tarihi
	StartTime  string    `gorm:"size:5;not null" json:"start_time"`           // "14:30"
	EndTime    string    `gorm:"size:5;not null" json:"end_time"`             // "15:00"
	Status     string    `gorm:"size:20;default:pending;index" json:"status"` // pending, confirmed, cancelled, completed, no_show
	Note       string    `gorm:"type:text" json:"note,omitempty"`             // Kullanıcı notu
	Price      float64   `gorm:"type:decimal(10,2)" json:"price"`             // Randevu anındaki fiyat
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt  time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

// Randevu oluşturma DTO
type CreateAppointmentRequest struct {
	BusinessID uint   `json:"business_id" binding:"required"`
	ServiceID  uint   `json:"service_id" binding:"required"`
	Date       string `json:"date" binding:"required"`       // "2026-02-25"
	StartTime  string `json:"start_time" binding:"required"` // "14:30"
	Note       string `json:"note"`
}

// Randevu durumu güncelleme DTO
type UpdateAppointmentStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=confirmed cancelled completed no_show"`
}

// Randevu filtreleme DTO
type AppointmentFilter struct {
	UserID     uint   `form:"user_id"`
	BusinessID uint   `form:"business_id"`
	Status     string `form:"status"`
	DateFrom   string `form:"date_from"` // "2026-02-01"
	DateTo     string `form:"date_to"`   // "2026-02-28"
	Page       int    `form:"page"`
	Limit      int    `form:"limit"`
}
