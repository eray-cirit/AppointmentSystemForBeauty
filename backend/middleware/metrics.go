package middleware

import (
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	// HTTP request toplam sayacı
	httpRequestsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "ciryt_http_requests_total",
			Help: "Total number of HTTP requests",
		},
		[]string{"method", "path", "status"},
	)

	// HTTP request süre histogramı
	httpRequestDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "ciryt_http_request_duration_seconds",
			Help:    "HTTP request duration in seconds",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "path"},
	)

	// Aktif bağlantı sayacı
	httpActiveRequests = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "ciryt_http_active_requests",
			Help: "Number of active HTTP requests",
		},
	)

	// DB sorgu sayacı
	DBQueriesTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "ciryt_db_queries_total",
			Help: "Total number of database queries",
		},
		[]string{"operation"},
	)

	// Business metrik
	BusinessesTotal = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "ciryt_businesses_total",
			Help: "Total number of registered businesses",
		},
	)

	// Appointment metrik
	AppointmentsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "ciryt_appointments_total",
			Help: "Total number of appointments created",
		},
		[]string{"status"},
	)
)

// Prometheus metrics middleware
func MetricsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		httpActiveRequests.Inc()

		c.Next()

		duration := time.Since(start).Seconds()
		status := strconv.Itoa(c.Writer.Status())
		path := c.FullPath()
		if path == "" {
			path = "unknown"
		}

		httpRequestsTotal.WithLabelValues(c.Request.Method, path, status).Inc()
		httpRequestDuration.WithLabelValues(c.Request.Method, path).Observe(duration)
		httpActiveRequests.Dec()
	}
}
