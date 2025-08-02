package controllers

import (
	"net/http"
	"quickdesk-backend/internal/models"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TicketController struct {
	db *gorm.DB
}

func NewTicketController(db *gorm.DB) *TicketController {
	return &TicketController{db: db}
}

type CreateTicketRequest struct {
	Subject     string                `json:"subject" binding:"required"`
	Description string                `json:"description" binding:"required"`
	Priority    models.TicketPriority `json:"priority"`
	CategoryID  uuid.UUID             `json:"category_id" binding:"required"`
}

type UpdateTicketRequest struct {
	Subject      string                `json:"subject,omitempty"`
	Description  string                `json:"description,omitempty"`
	Status       models.TicketStatus   `json:"status,omitempty"`
	Priority     models.TicketPriority `json:"priority,omitempty"`
	AssignedToID *uuid.UUID            `json:"assigned_to_id,omitempty"`
}

type AddCommentRequest struct {
	Content    string `json:"content" binding:"required"`
	IsInternal bool   `json:"is_internal,omitempty"`
}

type VoteRequest struct {
	Type models.VoteType `json:"type" binding:"required"`
}

func (tc *TicketController) GetTickets(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userRole, _ := c.Get("user_role")

	// Query parameters
	status := c.Query("status")
	category := c.Query("category")
	assignedTo := c.Query("assigned_to")
	createdBy := c.Query("created_by")
	search := c.Query("search")
	sortBy := c.DefaultQuery("sort_by", "created_at")
	sortOrder := c.DefaultQuery("sort_order", "desc")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	query := tc.db.Model(&models.Ticket{}).
		Preload("CreatedBy").
		Preload("AssignedTo").
		Preload("Category")

	// Apply filters based on user role
	if userRole == models.RoleUser {
		// Users can only see their own tickets
		query = query.Where("created_by_id = ?", userID)
	}

	// Apply filters
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if category != "" {
		query = query.Where("category_id = ?", category)
	}
	if assignedTo != "" {
		query = query.Where("assigned_to_id = ?", assignedTo)
	}
	if createdBy != "" {
		query = query.Where("created_by_id = ?", createdBy)
	}
	if search != "" {
		query = query.Where("subject ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	// Apply sorting
	orderClause := sortBy + " " + sortOrder
	if sortBy == "most_replied" {
		// This would need a subquery to count comments
		orderClause = "created_at desc" // Fallback for now
	}
	query = query.Order(orderClause)

	// Count total
	var total int64
	query.Count(&total)

	// Apply pagination
	offset := (page - 1) * limit
	query = query.Offset(offset).Limit(limit)

	var tickets []models.Ticket
	if err := query.Find(&tickets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tickets"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"tickets": tickets,
		"total":   total,
		"page":    page,
		"limit":   limit,
	})
}

func (tc *TicketController) CreateTicket(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req CreateTicketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify category exists
	var category models.Category
	if err := tc.db.First(&category, req.CategoryID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category"})
		return
	}

	ticket := models.Ticket{
		ID:          uuid.New(),
		Subject:     req.Subject,
		Description: req.Description,
		Priority:    req.Priority,
		Status:      models.StatusOpen,
		CreatedByID: userID.(uuid.UUID),
		CategoryID:  req.CategoryID,
	}

	if err := tc.db.Create(&ticket).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create ticket"})
		return
	}

	// Load relationships
	tc.db.Preload("CreatedBy").Preload("Category").First(&ticket, ticket.ID)

	c.JSON(http.StatusCreated, ticket)
}

func (tc *TicketController) GetTicket(c *gin.Context) {
	ticketID := c.Param("id")
	userID, _ := c.Get("user_id")
	userRole, _ := c.Get("user_role")

	var ticket models.Ticket
	query := tc.db.Preload("CreatedBy").
		Preload("AssignedTo").
		Preload("Category").
		Preload("Comments").
		Preload("Comments.User").
		Preload("Attachments")

	if err := query.First(&ticket, "id = ?", ticketID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket not found"})
		return
	}

	// Check permissions
	if userRole == models.RoleUser && ticket.CreatedByID != userID.(uuid.UUID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	// Increment view count
	tc.db.Model(&ticket).Update("view_count", gorm.Expr("view_count + 1"))

	c.JSON(http.StatusOK, ticket)
}

func (tc *TicketController) UpdateTicket(c *gin.Context) {
	ticketID := c.Param("id")
	userID, _ := c.Get("user_id")
	userRole, _ := c.Get("user_role")

	var req UpdateTicketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var ticket models.Ticket
	if err := tc.db.First(&ticket, "id = ?", ticketID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket not found"})
		return
	}

	// Check permissions
	if userRole == models.RoleUser && ticket.CreatedByID != userID.(uuid.UUID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	// Users can only update subject and description, agents/admins can update everything
	updates := make(map[string]interface{})
	if req.Subject != "" {
		updates["subject"] = req.Subject
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}

	if userRole != models.RoleUser {
		if req.Status != "" {
			updates["status"] = req.Status
		}
		if req.Priority != "" {
			updates["priority"] = req.Priority
		}
		if req.AssignedToID != nil {
			updates["assigned_to_id"] = req.AssignedToID
		}
	}

	if err := tc.db.Model(&ticket).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update ticket"})
		return
	}

	// Reload ticket with relationships
	tc.db.Preload("CreatedBy").Preload("AssignedTo").Preload("Category").First(&ticket, ticket.ID)

	c.JSON(http.StatusOK, ticket)
}

func (tc *TicketController) DeleteTicket(c *gin.Context) {
	ticketID := c.Param("id")
	userID, _ := c.Get("user_id")
	userRole, _ := c.Get("user_role")

	var ticket models.Ticket
	if err := tc.db.First(&ticket, "id = ?", ticketID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket not found"})
		return
	}

	// Only ticket creator or admin can delete
	if userRole != models.RoleAdmin && ticket.CreatedByID != userID.(uuid.UUID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	if err := tc.db.Delete(&ticket).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete ticket"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Ticket deleted successfully"})
}

func (tc *TicketController) AddComment(c *gin.Context) {
	ticketID := c.Param("id")
	userID, _ := c.Get("user_id")
	userRole, _ := c.Get("user_role")

	var req AddCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify ticket exists and user has access
	var ticket models.Ticket
	if err := tc.db.First(&ticket, "id = ?", ticketID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket not found"})
		return
	}

	if userRole == models.RoleUser && ticket.CreatedByID != userID.(uuid.UUID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	comment := models.Comment{
		ID:         uuid.New(),
		Content:    req.Content,
		TicketID:   uuid.MustParse(ticketID),
		UserID:     userID.(uuid.UUID),
		IsInternal: req.IsInternal && userRole != models.RoleUser, // Only agents/admins can make internal comments
	}

	if err := tc.db.Create(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add comment"})
		return
	}

	// Load user relationship
	tc.db.Preload("User").First(&comment, comment.ID)

	c.JSON(http.StatusCreated, comment)
}

func (tc *TicketController) VoteTicket(c *gin.Context) {
	ticketID := c.Param("id")
	userID, _ := c.Get("user_id")

	var req VoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if user already voted
	var existingVote models.Vote
	err := tc.db.Where("ticket_id = ? AND user_id = ?", ticketID, userID).First(&existingVote).Error

	if err == nil {
		// Update existing vote
		if existingVote.Type != req.Type {
			tc.db.Model(&existingVote).Update("type", req.Type)
			tc.updateVoteCounts(ticketID)
		}
	} else {
		// Create new vote
		vote := models.Vote{
			ID:       uuid.New(),
			Type:     req.Type,
			TicketID: uuid.MustParse(ticketID),
			UserID:   userID.(uuid.UUID),
		}

		if err := tc.db.Create(&vote).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to vote"})
			return
		}

		tc.updateVoteCounts(ticketID)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Vote recorded successfully"})
}

func (tc *TicketController) AssignTicket(c *gin.Context) {
	ticketID := c.Param("id")
	userRole, _ := c.Get("user_role")

	if userRole == models.RoleUser {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	var req struct {
		AssignedToID uuid.UUID `json:"assigned_to_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify assignee exists and is an agent or admin
	var assignee models.User
	if err := tc.db.Where("id = ? AND (role = ? OR role = ?)",
		req.AssignedToID, models.RoleAgent, models.RoleAdmin).First(&assignee).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid assignee"})
		return
	}

	if err := tc.db.Model(&models.Ticket{}).Where("id = ?", ticketID).
		Updates(map[string]interface{}{
			"assigned_to_id": req.AssignedToID,
			"status":         models.StatusInProgress,
		}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign ticket"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Ticket assigned successfully"})
}

func (tc *TicketController) updateVoteCounts(ticketID string) {
	var upVotes, downVotes int64

	tc.db.Model(&models.Vote{}).Where("ticket_id = ? AND type = ?", ticketID, models.VoteUp).Count(&upVotes)
	tc.db.Model(&models.Vote{}).Where("ticket_id = ? AND type = ?", ticketID, models.VoteDown).Count(&downVotes)

	tc.db.Model(&models.Ticket{}).Where("id = ?", ticketID).Updates(map[string]interface{}{
		"up_votes":   upVotes,
		"down_votes": downVotes,
	})
}
