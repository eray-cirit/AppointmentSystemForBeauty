package handlers

import (
	"net/http"
	"strconv"

	"github.com/eray-cirit/ciryt-backend/models"
	"github.com/eray-cirit/ciryt-backend/services"
	"github.com/eray-cirit/ciryt-backend/utils"
	"github.com/gin-gonic/gin"
)

type BusinessHandler struct {
	businessService *services.BusinessService
}

func NewBusinessHandler() *BusinessHandler {
	return &BusinessHandler{
		businessService: services.NewBusinessService(),
	}
}

// GET /api/businesses
func (h *BusinessHandler) GetAll(c *gin.Context) {
	var filter models.BusinessFilter
	if err := c.ShouldBindQuery(&filter); err != nil {
		utils.BadRequest(c, "Geçersiz filtre parametreleri")
		return
	}

	businesses, total, err := h.businessService.GetBusinesses(filter)
	if err != nil {
		utils.InternalError(c, "İşletmeler yüklenemedi")
		return
	}

	utils.Success(c, http.StatusOK, "", gin.H{
		"businesses": businesses,
		"total":      total,
		"page":       filter.Page,
		"limit":      filter.Limit,
	})
}

// GET /api/businesses/:id
func (h *BusinessHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "Geçersiz işletme ID")
		return
	}

	business, err := h.businessService.GetBusinessByID(uint(id))
	if err != nil {
		utils.NotFound(c, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, "", business)
}

// POST /api/businesses
func (h *BusinessHandler) Create(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req models.CreateBusinessRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Geçersiz istek: "+err.Error())
		return
	}

	business, err := h.businessService.CreateBusiness(userID.(uint), req)
	if err != nil {
		utils.InternalError(c, err.Error())
		return
	}

	utils.Success(c, http.StatusCreated, "İşletme oluşturuldu", business)
}

// PUT /api/businesses/:id
func (h *BusinessHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "Geçersiz işletme ID")
		return
	}

	userID, _ := c.Get("userID")

	var req models.UpdateBusinessRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Geçersiz istek")
		return
	}

	business, err := h.businessService.UpdateBusiness(uint(id), userID.(uint), req)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, "İşletme güncellendi", business)
}

// DELETE /api/businesses/:id
func (h *BusinessHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "Geçersiz işletme ID")
		return
	}

	userID, _ := c.Get("userID")
	role, _ := c.Get("role")

	if err := h.businessService.DeleteBusiness(uint(id), userID.(uint), role.(string)); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, "İşletme silindi", nil)
}
