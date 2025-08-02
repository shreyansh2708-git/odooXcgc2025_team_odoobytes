package controllers

import (
    "encoding/json"
    "net/http"
    "quickdesk-backend/internal/models"
    "strconv"

    "github.com/go-chi/chi/v5"
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

func (tc *TicketController) GetTickets(w http.ResponseWriter, r *http.Request) {
    userID, _ := r.Context().Value("user_id").(uuid.UUID)
    userRole, _ := r.Context().Value("user_role").(models.Role)

    // Query parameters
    status := r.URL.Query().Get("status")
    category := r.URL.Query().Get("category")
    assignedTo := r.URL.Query().Get("assigned_to")
    createdBy := r.URL.Query().Get("created_by")
    search := r.URL.Query().Get("search")
    sortBy := r.URL.Query().Get("sort_by")
    sortOrder := r.URL.Query().Get("sort_order")
    page, _ := strconv.Atoi(r.URL.Query().Get("page"))
    limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

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
        http.Error(w, "Failed to fetch tickets", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]interface{}{
        "tickets": tickets,
        "total":   total,
        "page":    page,
        "limit":   limit,
    })
}

func (tc *TicketController) CreateTicket(w http.ResponseWriter, r *http.Request) {
    userID := r.Context().Value("user_id").(uuid.UUID)

    var req CreateTicketRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    // Verify category exists
    var category models.Category
    if err := tc.db.First(&category, req.CategoryID).Error; err != nil {
        http.Error(w, "Invalid category", http.StatusBadRequest)
        return
    }

    ticket := models.Ticket{
        ID:          uuid.New(),
        Subject:     req.Subject,
        Description: req.Description,
        Priority:    req.Priority,
        Status:      models.StatusOpen,
        CreatedByID: userID,
        CategoryID:  req.CategoryID,
    }

    if err := tc.db.Create(&ticket).Error; err != nil {
        http.Error(w, "Failed to create ticket", http.StatusInternalServerError)
        return
    }

    // Load relationships
    tc.db.Preload("CreatedBy").Preload("Category").First(&ticket, ticket.ID)

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(ticket)
}

func (tc *TicketController) GetTicket(w http.ResponseWriter, r *http.Request) {
    ticketID := chi.URLParam(r, "id")
    userID, _ := r.Context().Value("user_id").(uuid.UUID)
    userRole, _ := r.Context().Value("user_role").(models.Role)

    var ticket models.Ticket
    query := tc.db.Preload("CreatedBy").
        Preload("AssignedTo").
        Preload("Category").
        Preload("Comments").
        Preload("Comments.User").
        Preload("Attachments")

    if err := query.First(&ticket, "id = ?", ticketID).Error; err != nil {
        http.Error(w, "Ticket not found", http.StatusNotFound)
        return
    }

    // Check permissions
    if userRole == models.RoleUser && ticket.CreatedByID != userID {
        http.Error(w, "Access denied", http.StatusForbidden)
        return
    }

    // Increment view count
    tc.db.Model(&ticket).Update("view_count", gorm.Expr("view_count + 1"))

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(ticket)
}

func (tc *TicketController) UpdateTicket(w http.ResponseWriter, r *http.Request) {
    ticketID := chi.URLParam(r, "id")
    userID, _ := r.Context().Value("user_id").(uuid.UUID)
    userRole, _ := r.Context().Value("user_role").(models.Role)

    var req UpdateTicketRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    var ticket models.Ticket
    if err := tc.db.First(&ticket, "id = ?", ticketID).Error; err != nil {
        http.Error(w, "Ticket not found", http.StatusNotFound)
        return
    }

    // Check permissions
    if userRole == models.RoleUser && ticket.CreatedByID != userID {
        http.Error(w, "Access denied", http.StatusForbidden)
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
        http.Error(w, "Failed to update ticket", http.StatusInternalServerError)
        return
    }

    // Reload ticket with relationships
    tc.db.Preload("CreatedBy").Preload("AssignedTo").Preload("Category").First(&ticket, ticket.ID)

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(ticket)
}

func (tc *TicketController) DeleteTicket(w http.ResponseWriter, r *http.Request) {
    ticketID := chi.URLParam(r, "id")
    userID, _ := r.Context().Value("user_id").(uuid.UUID)
    userRole, _ := r.Context().Value("user_role").(models.Role)

    var ticket models.Ticket
    if err := tc.db.First(&ticket, "id = ?", ticketID).Error; err != nil {
        http.Error(w, "Ticket not found", http.StatusNotFound)
        return
    }

    // Only ticket creator or admin can delete
    if userRole != models.RoleAdmin && ticket.CreatedByID != userID {
        http.Error(w, "Access denied", http.StatusForbidden)
        return
    }

    if err := tc.db.Delete(&ticket).Error; err != nil {
        http.Error(w, "Failed to delete ticket", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{"message": "Ticket deleted successfully"})
}

func (tc *TicketController) AddComment(w http.ResponseWriter, r *http.Request) {
    ticketID := chi.URLParam(r, "id")
    userID, _ := r.Context().Value("user_id").(uuid.UUID)
    userRole, _ := r.Context().Value("user_role").(models.Role)

    var req AddCommentRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    // Verify ticket exists and user has access
    var ticket models.Ticket
    if err := tc.db.First(&ticket, "id = ?", ticketID).Error; err != nil {
        http.Error(w, "Ticket not found", http.StatusNotFound)
        return
    }

    if userRole == models.RoleUser && ticket.CreatedByID != userID {
        http.Error(w, "Access denied", http.StatusForbidden)
        return
    }

    comment := models.Comment{
        ID:         uuid.New(),
        Content:    req.Content,
        TicketID:   uuid.MustParse(ticketID),
        UserID:     userID,
        IsInternal: req.IsInternal && userRole != models.RoleUser, // Only agents/admins can make internal comments
    }

    if err := tc.db.Create(&comment).Error; err != nil {
        http.Error(w, "Failed to add comment", http.StatusInternalServerError)
        return
    }

    // Load user relationship
    tc.db.Preload("User").First(&comment, comment.ID)

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(comment)
}

func (tc *TicketController) VoteTicket(w http.ResponseWriter, r *http.Request) {
    ticketID := chi.URLParam(r, "id")
    userID, _ := r.Context().Value("user_id").(uuid.UUID)

    var req VoteRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
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
            UserID:   userID,
        }

        if err := tc.db.Create(&vote).Error; err != nil {
            http.Error(w, "Failed to vote", http.StatusInternalServerError)
            return
        }

        tc.updateVoteCounts(ticketID)
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{"message": "Vote recorded successfully"})
}

func (tc *TicketController) AssignTicket(w http.ResponseWriter, r *http.Request) {
    ticketID := chi.URLParam(r, "id")
    userRole, _ := r.Context().Value("user_role").(models.Role)

    if userRole == models.RoleUser {
        http.Error(w, "Access denied", http.StatusForbidden)
        return
    }

    var req struct {
        AssignedToID uuid.UUID `json:"assigned_to_id" binding:"required"`
    }

    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    // Verify assignee exists and is an agent or admin
    var assignee models.User
    if err := tc.db.Where("id = ? AND (role = ? OR role = ?)",
        req.AssignedToID, models.RoleAgent, models.RoleAdmin).First(&assignee).Error; err != nil {
        http.Error(w, "Invalid assignee", http.StatusBadRequest)
        return
    }

    if err := tc.db.Model(&models.Ticket{}).Where("id = ?", ticketID).
        Updates(map[string]interface{}{
            "assigned_to_id": req.AssignedToID,
            "status":         models.StatusInProgress,
        }).Error; err != nil {
        http.Error(w, "Failed to assign ticket", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{"message": "Ticket assigned successfully"})
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