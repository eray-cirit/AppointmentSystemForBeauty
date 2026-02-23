-- 004_create_appointments.up.sql
CREATE TABLE IF NOT EXISTS appointments (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id  BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    service_id   BIGINT NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    date         DATE NOT NULL,
    start_time   VARCHAR(5) NOT NULL,  -- "HH:MM"
    end_time     VARCHAR(5) NOT NULL,  -- "HH:MM"
    status       VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
    note         TEXT,
    price        DECIMAL(10,2),
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Performans indexleri
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments (user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_business_id ON appointments (business_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON appointments (service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments (date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments (status);

-- Çakışma kontrolü için composite index
CREATE INDEX IF NOT EXISTS idx_appointments_conflict 
    ON appointments (business_id, date, start_time, end_time) 
    WHERE status NOT IN ('cancelled', 'no_show');

-- Kullanıcının aktif randevuları
CREATE INDEX IF NOT EXISTS idx_appointments_user_active 
    ON appointments (user_id, date DESC) 
    WHERE status NOT IN ('cancelled', 'no_show');
