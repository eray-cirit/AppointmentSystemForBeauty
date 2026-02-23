-- 004_create_appointments.down.sql
DROP INDEX IF EXISTS idx_appointments_user_active;
DROP INDEX IF EXISTS idx_appointments_conflict;
DROP INDEX IF EXISTS idx_appointments_status;
DROP INDEX IF EXISTS idx_appointments_date;
DROP INDEX IF EXISTS idx_appointments_service_id;
DROP INDEX IF EXISTS idx_appointments_business_id;
DROP INDEX IF EXISTS idx_appointments_user_id;
DROP TABLE IF EXISTS appointments;
