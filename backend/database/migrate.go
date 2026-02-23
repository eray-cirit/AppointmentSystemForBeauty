package database

import (
	"fmt"
	"log/slog"

	"github.com/eray-cirit/ciryt-backend/config"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

// Versiyonlu migration'ları çalıştır
func RunMigrations(cfg *config.Config) error {
	dsn := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=disable",
		cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBName,
	)

	m, err := migrate.New("file://migrations", dsn)
	if err != nil {
		slog.Warn("Migration dosyaları bulunamadı, AutoMigrate kullanılacak", "error", err)
		return nil
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return fmt.Errorf("migration hatası: %w", err)
	}

	version, dirty, _ := m.Version()
	slog.Info("✅ Migration tamamlandı", "version", version, "dirty", dirty)

	return nil
}
