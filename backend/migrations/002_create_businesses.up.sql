-- 002_create_businesses.up.sql
CREATE TABLE IF NOT EXISTS businesses (
    id           BIGSERIAL PRIMARY KEY,
    owner_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name         VARCHAR(255) NOT NULL,
    slug         VARCHAR(255),
    description  TEXT,
    gender       VARCHAR(10) CHECK (gender IN ('male', 'female', 'unisex')),
    city         VARCHAR(100) NOT NULL,
    district     VARCHAR(100),
    address      TEXT,
    phone        VARCHAR(20),
    lat          DECIMAL(10,7),
    lng          DECIMAL(10,7),
    rating       DECIMAL(2,1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    is_verified  BOOLEAN DEFAULT false,
    is_active    BOOLEAN DEFAULT true,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_businesses_slug ON businesses (slug);
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses (owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses (city);
CREATE INDEX IF NOT EXISTS idx_businesses_gender ON businesses (gender);
CREATE INDEX IF NOT EXISTS idx_businesses_active ON businesses (is_active) WHERE is_active = true;
