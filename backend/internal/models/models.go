package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Role string

const (
	RoleUser  Role = "user"
	RoleAgent Role = "agent"
	RoleAdmin Role = "admin"
)

type User struct {
	ID        uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Email     string         `json:"email" gorm:"unique;not null"`
	Password  string         `json:"-" gorm:"not null"`
	FirstName string         `json:"first_name" gorm:"not null"`
	LastName  string         `json:"last_name" gorm:"not null"`
	Role      Role           `json:"role" gorm:"default:user"`
	IsActive  bool           `json:"is_active" gorm:"default:true"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`

	// Relations
	CreatedTickets  []Ticket  `json:"created_tickets,omitempty" gorm:"foreignKey:CreatedByID"`
	AssignedTickets []Ticket  `json:"assigned_tickets,omitempty" gorm:"foreignKey:AssignedToID"`
	Comments        []Comment `json:"comments,omitempty"`
	Votes           []Vote    `json:"votes,omitempty"`
}

type TicketStatus string

const (
	StatusOpen       TicketStatus = "open"
	StatusInProgress TicketStatus = "in_progress"
	StatusResolved   TicketStatus = "resolved"
	StatusClosed     TicketStatus = "closed"
)

type TicketPriority string

const (
	PriorityLow    TicketPriority = "low"
	PriorityMedium TicketPriority = "medium"
	PriorityHigh   TicketPriority = "high"
	PriorityUrgent TicketPriority = "urgent"
)

type Category struct {
	ID          uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Name        string         `json:"name" gorm:"unique;not null"`
	Description string         `json:"description"`
	Color       string         `json:"color" gorm:"default:#007bff"`
	IsActive    bool           `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"deleted_at" gorm:"index"`

	// Relations
	Tickets []Ticket `json:"tickets,omitempty"`
}

type Ticket struct {
	ID           uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Subject      string         `json:"subject" gorm:"not null"`
	Description  string         `json:"description" gorm:"not null"`
	Status       TicketStatus   `json:"status" gorm:"default:open"`
	Priority     TicketPriority `json:"priority" gorm:"default:medium"`
	CreatedByID  uuid.UUID      `json:"created_by_id" gorm:"not null"`
	AssignedToID *uuid.UUID     `json:"assigned_to_id"`
	CategoryID   uuid.UUID      `json:"category_id" gorm:"not null"`
	UpVotes      int            `json:"up_votes" gorm:"default:0"`
	DownVotes    int            `json:"down_votes" gorm:"default:0"`
	ViewCount    int            `json:"view_count" gorm:"default:0"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"deleted_at" gorm:"index"`

	// Relations
	CreatedBy   User         `json:"created_by" gorm:"foreignKey:CreatedByID"`
	AssignedTo  *User        `json:"assigned_to,omitempty" gorm:"foreignKey:AssignedToID"`
	Category    Category     `json:"category" gorm:"foreignKey:CategoryID"`
	Comments    []Comment    `json:"comments,omitempty"`
	Attachments []Attachment `json:"attachments,omitempty"`
	Votes       []Vote       `json:"votes,omitempty"`
}

type Comment struct {
	ID         uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Content    string         `json:"content" gorm:"not null"`
	TicketID   uuid.UUID      `json:"ticket_id" gorm:"not null"`
	UserID     uuid.UUID      `json:"user_id" gorm:"not null"`
	IsInternal bool           `json:"is_internal" gorm:"default:false"` // For agent-only comments
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `json:"deleted_at" gorm:"index"`

	// Relations
	Ticket User `json:"ticket" gorm:"foreignKey:TicketID"`
	User   User `json:"user" gorm:"foreignKey:UserID"`
}

type VoteType string

const (
	VoteUp   VoteType = "up"
	VoteDown VoteType = "down"
)

type Vote struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Type      VoteType  `json:"type" gorm:"not null"`
	TicketID  uuid.UUID `json:"ticket_id" gorm:"not null"`
	UserID    uuid.UUID `json:"user_id" gorm:"not null"`
	CreatedAt time.Time `json:"created_at"`

	// Relations
	Ticket Ticket `json:"ticket" gorm:"foreignKey:TicketID"`
	User   User   `json:"user" gorm:"foreignKey:UserID"`
}

type Attachment struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	FileName  string    `json:"file_name" gorm:"not null"`
	FilePath  string    `json:"file_path" gorm:"not null"`
	FileSize  int64     `json:"file_size"`
	MimeType  string    `json:"mime_type"`
	TicketID  uuid.UUID `json:"ticket_id" gorm:"not null"`
	UserID    uuid.UUID `json:"user_id" gorm:"not null"`
	CreatedAt time.Time `json:"created_at"`

	// Relations
	Ticket Ticket `json:"ticket" gorm:"foreignKey:TicketID"`
	User   User   `json:"user" gorm:"foreignKey:UserID"`
}

// Add indexes for better performance
func (User) TableName() string {
	return "users"
}

func (Category) TableName() string {
	return "categories"
}

func (Ticket) TableName() string {
	return "tickets"
}

func (Comment) TableName() string {
	return "comments"
}

func (Vote) TableName() string {
	return "votes"
}

func (Attachment) TableName() string {
	return "attachments"
}
