-- 002_create_businesses.down.sql
DROP INDEX IF EXISTS idx_businesses_active;
DROP INDEX IF EXISTS idx_businesses_gender;
DROP INDEX IF EXISTS idx_businesses_city;
DROP INDEX IF EXISTS idx_businesses_owner_id;
DROP INDEX IF EXISTS idx_businesses_slug;
DROP TABLE IF EXISTS businesses;
