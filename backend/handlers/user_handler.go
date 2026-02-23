package handlers

import (
	"net/http"
	"strconv"

	"github.com/eray-cirit/ciryt-backend/models"
	"github.com/eray-cirit/ciryt-backend/services"
	"github.com/eray-cirit/ciryt-backend/utils"
	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	userService *services.UserService
}

func NewUserHandler() *UserHandler {
	return &UserHandler{
		userService: services.NewUserService(),
	}
}

// GET /api/users (admin only)
func (h *UserHandler) GetAll(c *gin.Context) {
	users, err := h.userService.GetAllUsers()
	if err != nil {
		utils.InternalError(c, "Kullanıcılar yüklenemedi")
		return
	}

	utils.Success(c, http.StatusOK, "", gin.H{
		"users": users,
		"count": len(users),
	})
}

// GET /api/users/:id
func (h *UserHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "Geçersiz kullanıcı ID")
		return
	}

	user, err := h.userService.GetUserByID(uint(id))
	if err != nil {
		utils.NotFound(c, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, "", user)
}

// PUT /api/users/:id
func (h *UserHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "Geçersiz kullanıcı ID")
		return
	}

	// Sadece kendi profilini güncelleyebilir
	currentUserID, _ := c.Get("userID")
	role, _ := c.Get("role")
	if uint(id) != currentUserID.(uint) && role.(string) != "admin" {
		utils.Forbidden(c, "Bu profili düzenleme yetkiniz yok")
		return
	}

	var req models.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Geçersiz istek")
		return
	}

	user, err := h.userService.UpdateProfile(uint(id), req)
	if err != nil {
		utils.InternalError(c, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, "Profil güncellendi", user)
}

// DELETE /api/users/:id (admin only)
func (h *UserHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "Geçersiz kullanıcı ID")
		return
	}

	if err := h.userService.DeleteUser(uint(id)); err != nil {
		utils.NotFound(c, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, "Kullanıcı silindi", nil)
}
