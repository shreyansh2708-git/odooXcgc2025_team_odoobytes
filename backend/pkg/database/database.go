package database

import (
	"quickdesk-backend/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Initialize(databaseURL string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// Auto migrate the schema
	err = db.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Ticket{},
		&models.Comment{},
		&models.Vote{},
		&models.Attachment{},
	)
	if err != nil {
		return nil, err
	}

	return db, nil
}
