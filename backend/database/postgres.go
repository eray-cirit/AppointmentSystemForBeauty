package database

import (
	"fmt"
	"log"

	"github.com/eray-cirit/ciryt-backend/config"
	"github.com/eray-cirit/ciryt-backend/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectPostgres(cfg *config.Config) {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable TimeZone=Europe/Istanbul",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName,
	)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("❌ PostgreSQL bağlantı hatası: %v", err)
	}

	log.Println("✅ PostgreSQL bağlantısı başarılı")

	// Auto migrate
	err = DB.AutoMigrate(
		&models.User{},
		&models.Business{},
		&models.Service{},
		&models.Appointment{},
	)
	if err != nil {
		log.Fatalf("❌ Migration hatası: %v", err)
	}

	log.Println("✅ Veritabanı tabloları oluşturuldu")
}
