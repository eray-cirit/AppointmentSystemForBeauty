-- 003_create_services.up.sql
CREATE TABLE IF NOT EXISTS services (
    id           BIGSERIAL PRIMARY KEY,
    business_id  BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name         VARCHAR(255) NOT NULL,
    description  TEXT,
    duration     INTEGER NOT NULL CHECK (duration >= 5 AND duration <= 480),
    price        DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    gender       VARCHAR(10) CHECK (gender IN ('male', 'female', 'unisex')),
    is_active    BOOLEAN DEFAULT true,
    sort_order   INTEGER DEFAULT 0,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_business_id ON services (business_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services (business_id, is_active) WHERE is_active = true;
