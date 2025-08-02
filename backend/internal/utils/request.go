package utils

import (
	"net/http"
	"quickdesk-backend/internal/middleware"
	"quickdesk-backend/internal/models"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

// GetURLParam gets a URL parameter from Chi router
func GetURLParam(r *http.Request, key string) string {
	return chi.URLParam(r, key)
}

// GetUserIDFromContext gets the user ID from request context
func GetUserIDFromContext(r *http.Request) (uuid.UUID, bool) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	return userID, ok
}

// GetUserRoleFromContext gets the user role from request context
func GetUserRoleFromContext(r *http.Request) (models.Role, bool) {
	role, ok := r.Context().Value(middleware.UserRoleKey).(models.Role)
	return role, ok
}
