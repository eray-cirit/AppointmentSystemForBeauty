package handlers

import (
	"net/http"
	"strconv"

	"github.com/eray-cirit/ciryt-backend/models"
	"github.com/eray-cirit/ciryt-backend/services"
	"github.com/eray-cirit/ciryt-backend/utils"
	"github.com/gin-gonic/gin"
)

type ServiceHandler struct {
	serviceService *services.ServiceService
}

func NewServiceHandler() *ServiceHandler {
	return &ServiceHandler{
		serviceService: services.NewServiceService(),
	}
}

// GET /api/v1/businesses/:id/services — İşletmenin hizmetlerini listele
func (h *ServiceHandler) GetByBusiness(c *gin.Context) {
	businessID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "Geçersiz işletme ID")
		return
	}

	svcs, err := h.serviceService.GetServicesByBusiness(uint(businessID))
	if err != nil {
		utils.InternalError(c, "Hizmetler yüklenemedi")
		return
	}

	utils.Success(c, http.StatusOK, "", gin.H{
		"services": svcs,
		"count":    len(svcs),
	})
}

// POST /api/v1/businesses/:id/services — Hizmet ekle
func (h *ServiceHandler) Create(c *gin.Context) {
	businessID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "Geçersiz işletme ID")
		return
	}

	userID, _ := c.Get("userID")

	var req models.CreateServiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Geçersiz istek: "+err.Error())
		return
	}

	svc, err := h.serviceService.CreateService(userID.(uint), uint(businessID), req)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, http.StatusCreated, "Hizmet oluşturuldu", svc)
}

// PUT /api/v1/services/:id — Hizmet güncelle
func (h *ServiceHandler) Update(c *gin.Context) {
	serviceID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "Geçersiz hizmet ID")
		return
	}

	userID, _ := c.Get("userID")

	var req models.UpdateServiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Geçersiz istek")
		return
	}

	svc, err := h.serviceService.UpdateService(userID.(uint), uint(serviceID), req)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, "Hizmet güncellendi", svc)
}

// DELETE /api/v1/services/:id — Hizmet sil
func (h *ServiceHandler) Delete(c *gin.Context) {
	serviceID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "Geçersiz hizmet ID")
		return
	}

	userID, _ := c.Get("userID")

	if err := h.serviceService.DeleteService(userID.(uint), uint(serviceID)); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, "Hizmet silindi", nil)
}
