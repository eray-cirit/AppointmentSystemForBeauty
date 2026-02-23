#!/bin/bash
# Ciryt Backend — PostgreSQL ve Redis kurulum scripti
# Kullanım: sudo bash setup-db.sh

set -e

echo "🐘 PostgreSQL kullanıcı ve veritabanı oluşturuluyor..."
sudo -u postgres psql <<EOF
CREATE USER ciryt WITH PASSWORD 'ciryt2026';
CREATE DATABASE ciryt_db OWNER ciryt;
GRANT ALL PRIVILEGES ON DATABASE ciryt_db TO ciryt;
\c ciryt_db
GRANT ALL ON SCHEMA public TO ciryt;
EOF

echo "✅ PostgreSQL hazır: ciryt_db / ciryt"

echo "📡 Redis kontrol ediliyor..."
redis-cli ping
echo "✅ Redis hazır"

echo ""
echo "🎉 Tüm veritabanları hazır!"
echo "   PostgreSQL: localhost:5432 / ciryt_db"
echo "   Redis:      localhost:6379"
