package controllers

import (
	"encoding/json"
	"net/http"
	"quickdesk-backend/internal/models"
	"quickdesk-backend/internal/utils"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CategoryController struct {
	db *gorm.DB
}

type CreateCategoryRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Color       string `json:"color"`
}

type UpdateCategoryRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Color       string `json:"color"`
	IsActive    *bool  `json:"is_active"`
}

func NewCategoryController(db *gorm.DB) *CategoryController {
	return &CategoryController{db: db}
}



func (cc *CategoryController) GetCategories(w http.ResponseWriter, r *http.Request) {
	var categories []models.Category

	query := cc.db.Model(&models.Category{})

	// Only show active categories for non-admin users
	userRole, _ := utils.GetUserRoleFromContext(r)
	if userRole != models.RoleAdmin {
		query = query.Where("is_active = ?", true)
	}

	if err := query.Find(&categories).Error; err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch categories"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(categories)
}

func (cc *CategoryController) CreateCategory(w http.ResponseWriter, r *http.Request) {
	var req CreateCategoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	// Basic validation
	if req.Name == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Category name is required"})
		return
	}

	// Check if category name already exists
	var existingCategory models.Category
	if err := cc.db.Where("name = ?", req.Name).First(&existingCategory).Error; err == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(map[string]string{"error": "Category name already exists"})
		return
	}

	color := req.Color
	if color == "" {
		color = "#007bff" // Default color
	}

	category := models.Category{
		ID:          uuid.New(),
		Name:        req.Name,
		Description: req.Description,
		Color:       color,
		IsActive:    true,
	}

	if err := cc.db.Create(&category).Error; err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to create category"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(category)
}

func (cc *CategoryController) UpdateCategory(w http.ResponseWriter, r *http.Request) {
	categoryID := utils.GetURLParam(r, "id")

	var req UpdateCategoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	var category models.Category
	if err := cc.db.First(&category, "id = ?", categoryID).Error; err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Category not found"})
		return
	}

	updates := make(map[string]interface{})

	if req.Name != "" {
		// Check if new name conflicts with existing category
		var existingCategory models.Category
		if err := cc.db.Where("name = ? AND id != ?", req.Name, categoryID).First(&existingCategory).Error; err == nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusConflict)
			json.NewEncoder(w).Encode(map[string]string{"error": "Category name already exists"})
			return
		}
		updates["name"] = req.Name
	}

	if req.Description != "" {
		updates["description"] = req.Description
	}

	if req.Color != "" {
		updates["color"] = req.Color
	}

	if req.IsActive != nil {
		updates["is_active"] = *req.IsActive
	}

	if err := cc.db.Model(&category).Updates(updates).Error; err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to update category"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(category)
}

func (cc *CategoryController) DeleteCategory(w http.ResponseWriter, r *http.Request) {
	categoryID := utils.GetURLParam(r, "id")

	var category models.Category
	if err := cc.db.First(&category, "id = ?", categoryID).Error; err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Category not found"})
		return
	}

	// Check if category is being used by tickets
	var ticketCount int64
	cc.db.Model(&models.Ticket{}).Where("category_id = ?", categoryID).Count(&ticketCount)

	if ticketCount > 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"error":        "Cannot delete category that is being used by tickets",
			"ticket_count": ticketCount,
		})
		return
	}

	if err := cc.db.Delete(&category).Error; err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to delete category"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Category deleted successfully"})
}
