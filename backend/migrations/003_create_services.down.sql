-- 003_create_services.down.sql
DROP INDEX IF EXISTS idx_services_active;
DROP INDEX IF EXISTS idx_services_business_id;
DROP TABLE IF EXISTS services;
