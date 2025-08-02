# QuickDesk - Help Desk Ticketing System

## Overview
QuickDesk is a comprehensive help desk solution that allows users to create and track support tickets while enabling support agents to manage and resolve them efficiently.

## Features

### User Roles
- **End Users**: Create and track tickets, view their own tickets
- **Support Agents**: Manage, assign, and resolve tickets
- **Admin**: User management, category management, system oversight

### Core Functionality
- User registration and authentication
- Ticket creation with attachments and categories
- Real-time ticket status updates
- Email notifications
- Search and filtering capabilities
- Voting system for tickets
- Threaded conversations
- Dashboard with analytics

### Ticket Workflow
1. **Open** → User creates ticket
2. **In Progress** → Agent picks up ticket
3. **Resolved** → Agent resolves issue
4. **Closed** → Ticket is closed

## Tech Stack
- **Frontend**: React.js with TypeScript
- **Backend**: Go (Golang) with Chi router
- **Database**: PostgreSQL with GORM ORM
- **Authentication**: JWT tokens
- **File Upload**: Multipart form handling
- **Email**: Go email libraries (gomail)
- **Real-time**: WebSockets with Gorilla

## Getting Started

### Prerequisites
- Go 1.21+
- PostgreSQL 13+
- Node.js (v16+) for frontend
- npm or yarn

### Installation

#### Backend
```bash
cd backend
go mod tidy
go run main.go
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

## Project Structure
```
├── backend/               # Go API with Chi router
│   ├── cmd/
│   │   └── server/        # Application entry point
│   ├── internal/
│   │   ├── controllers/   # HTTP handlers
│   │   ├── models/        # GORM models
│   │   ├── services/      # Business logic layer
│   │   ├── repositories/  # Data access layer
│   │   ├── middleware/    # Custom middleware
│   │   ├── config/        # Configuration management
│   │   └── utils/         # Utility functions
│   ├── pkg/
│   │   ├── auth/          # Authentication utilities
│   │   ├── email/         # Email service
│   │   ├── database/      # Database connection
│   │   └── websocket/     # WebSocket handling
│   ├── migrations/        # Database migrations
│   ├── uploads/           # File uploads directory
│   ├── docs/              # API documentation
│   ├── go.mod
│   ├── go.sum
│   └── main.go            # Application entry point
├── frontend/              # React TypeScript application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   ├── types/         # TypeScript types
│   │   └── styles/        # CSS/SCSS files
│   ├── public/            # Static assets
│   ├── package.json
│   └── tsconfig.json
└── docs/                  # Project documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Tickets
- `GET /api/tickets` - Get tickets with filters
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets/:id` - Get ticket details
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket
- `POST /api/tickets/:id/comments` - Add comment
- `POST /api/tickets/:id/vote` - Vote on ticket

### Users
- `GET /api/users` - Get users (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

## License
MIT License
