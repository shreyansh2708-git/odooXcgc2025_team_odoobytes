package main

import (
	"log"
	"net/http"
	"os"
	"quickdesk-backend/internal/config"
	"quickdesk-backend/internal/controllers"
	"quickdesk-backend/internal/middleware"
	"quickdesk-backend/pkg/database"

	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Initialize configuration
	cfg := config.Load()

	// Initialize database
	db, err := database.Initialize(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Initialize Chi router
	r := chi.NewRouter()

	// Configure middleware
	r.Use(chiMiddleware.Logger)
	r.Use(chiMiddleware.Recoverer)
	r.Use(chiMiddleware.RequestID)
	r.Use(chiMiddleware.RealIP)

	// Configure CORS
	r.Use(cors.Handler(cors.Options{
    AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:3000"},
    AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
    ExposedHeaders:   []string{"Link"},
    AllowCredentials: true,
    MaxAge:           300,
	}))

	// Initialize controllers
	authController := controllers.NewAuthController(db)
	userController := controllers.NewUserController(db)
	ticketController := controllers.NewTicketController(db)
	categoryController := controllers.NewCategoryController(db)

	// API routes
	r.Route("/api", func(r chi.Router) {
		// Authentication routes (public)
		r.Route("/auth", func(r chi.Router) {
			r.Post("/register", authController.Register)
			r.Post("/login", authController.Login)
			r.Post("/logout", authController.Logout)
		})

		// Protected routes
		r.Group(func(r chi.Router) {
			r.Use(middleware.AuthMiddleware)

			// User routes
			r.Route("/users", func(r chi.Router) {
				r.Get("/", userController.GetUsers)
				r.Get("/{id}", userController.GetUser)
				r.Put("/{id}", userController.UpdateUser)
				r.Delete("/{id}", userController.DeleteUser)
			})

			// Ticket routes
			// ...existing code...

// Ticket routes
			r.Route("/tickets", func(r chi.Router) {
				r.Get("/", ticketController.GetTickets)              // List all tickets
				r.Post("/", ticketController.CreateTicket)           // Create a new ticket
				r.Route("/{id}", func(r chi.Router) {
        			r.Get("/", ticketController.GetTicket)           // Get a specific ticket
        			r.Put("/", ticketController.UpdateTicket)        // Update a specific ticket
        			r.Delete("/", ticketController.DeleteTicket)     // Delete a specific ticket
        			r.Post("/comments", ticketController.AddComment) // Add comment to a ticket
        			r.Post("/vote", ticketController.VoteTicket)     // Vote on a ticket
        			r.Post("/assign", ticketController.AssignTicket) // Assign a ticket
    			})
			})

// ...existing code...

			// Category routes (admin only)
			r.Route("/categories", func(r chi.Router) {
				r.Get("/", categoryController.GetCategories)

				// Admin only routes
				r.Group(func(r chi.Router) {
					r.Use(middleware.AdminMiddleware)
					r.Post("/", categoryController.CreateCategory)
					r.Put("/{id}", categoryController.UpdateCategory)
					r.Delete("/{id}", categoryController.DeleteCategory)
				})
			})
		})
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting server on port %s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
