# ==========================================
# Multi-stage Dockerfile — Ciryt Go Backend
# ==========================================

# Stage 1: Build
FROM golang:1.26-alpine AS builder

RUN apk add --no-cache git

WORKDIR /app

# Dependency cache
COPY go.mod go.sum ./
RUN go mod download

# Build
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o ciryt-api .

# Stage 2: Runtime (sadece binary)
FROM alpine:3.19

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

COPY --from=builder /app/ciryt-api .

EXPOSE 8080

# Timezone
ENV TZ=Europe/Istanbul

CMD ["./ciryt-api"]
