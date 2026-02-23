package handlers

import (
	"net/http"
	"strconv"

	"github.com/eray-cirit/ciryt-backend/models"
	"github.com/eray-cirit/ciryt-backend/services"
	"github.com/eray-cirit/ciryt-backend/utils"
	"github.com/gin-gonic/gin"
)

type AppointmentHandler struct {
	appointmentService *services.AppointmentService
}

func NewAppointmentHandler() *AppointmentHandler {
	return &AppointmentHandler{
		appointmentService: services.NewAppointmentService(),
	}
}

// POST /api/v1/appointments — Randevu oluştur
func (h *AppointmentHandler) Create(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req models.CreateAppointmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Geçersiz istek: "+err.Error())
		return
	}

	appointment, err := h.appointmentService.CreateAppointment(userID.(uint), req)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, http.StatusCreated, "Randevu oluşturuldu", appointment)
}

// GET /api/v1/appointments — Randevuları listele
func (h *AppointmentHandler) GetAll(c *gin.Context) {
	var filter models.AppointmentFilter
	if err := c.ShouldBindQuery(&filter); err != nil {
		utils.BadRequest(c, "Geçersiz filtre parametreleri")
		return
	}

	appointments, total, err := h.appointmentService.GetAppointments(filter)
	if err != nil {
		utils.InternalError(c, "Randevular yüklenemedi")
		return
	}

	utils.Success(c, http.StatusOK, "", gin.H{
		"appointments": appointments,
		"total":        total,
		"page":         filter.Page,
		"limit":        filter.Limit,
	})
}

// GET /api/v1/appointments/my — Benim randevularım
func (h *AppointmentHandler) GetMyAppointments(c *gin.Context) {
	userID, _ := c.Get("userID")

	appointments, err := h.appointmentService.GetUserAppointments(userID.(uint))
	if err != nil {
		utils.InternalError(c, "Randevular yüklenemedi")
		return
	}

	utils.Success(c, http.StatusOK, "", gin.H{
		"appointments": appointments,
		"count":        len(appointments),
	})
}

// GET /api/v1/appointments/:id — Randevu detayı
func (h *AppointmentHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "Geçersiz randevu ID")
		return
	}

	appointment, err := h.appointmentService.GetAppointmentByID(uint(id))
	if err != nil {
		utils.NotFound(c, "Randevu bulunamadı")
		return
	}

	utils.Success(c, http.StatusOK, "", appointment)
}

// PATCH /api/v1/appointments/:id/status — Randevu durumu güncelle
func (h *AppointmentHandler) UpdateStatus(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "Geçersiz randevu ID")
		return
	}

	userID, _ := c.Get("userID")
	role, _ := c.Get("role")

	var req models.UpdateAppointmentStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Geçersiz istek")
		return
	}

	appointment, err := h.appointmentService.UpdateStatus(uint(id), userID.(uint), role.(string), req.Status)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, "Randevu durumu güncellendi", appointment)
}
