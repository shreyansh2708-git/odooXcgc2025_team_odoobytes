package email

import (
	"fmt"
	"os"
	"strconv"

	"gopkg.in/gomail.v2"
)

type EmailService struct {
	host     string
	port     int
	username string
	password string
}

func NewEmailService() *EmailService {
	port, _ := strconv.Atoi(os.Getenv("SMTP_PORT"))
	if port == 0 {
		port = 587
	}

	return &EmailService{
		host:     os.Getenv("SMTP_HOST"),
		port:     port,
		username: os.Getenv("SMTP_USER"),
		password: os.Getenv("SMTP_PASS"),
	}
}

func (es *EmailService) SendTicketCreatedEmail(to, ticketSubject, ticketID string) error {
	subject := "New Ticket Created: " + ticketSubject
	body := fmt.Sprintf(`
		<h2>New Ticket Created</h2>
		<p>A new support ticket has been created:</p>
		<p><strong>Subject:</strong> %s</p>
		<p><strong>Ticket ID:</strong> %s</p>
		<p>You can view and manage this ticket in the QuickDesk system.</p>
	`, ticketSubject, ticketID)

	return es.sendEmail(to, subject, body)
}

func (es *EmailService) SendTicketUpdatedEmail(to, ticketSubject, ticketID, status string) error {
	subject := "Ticket Updated: " + ticketSubject
	body := fmt.Sprintf(`
		<h2>Ticket Status Updated</h2>
		<p>Your support ticket has been updated:</p>
		<p><strong>Subject:</strong> %s</p>
		<p><strong>Ticket ID:</strong> %s</p>
		<p><strong>New Status:</strong> %s</p>
		<p>You can view the details in the QuickDesk system.</p>
	`, ticketSubject, ticketID, status)

	return es.sendEmail(to, subject, body)
}

func (es *EmailService) SendTicketAssignedEmail(to, ticketSubject, ticketID, assigneeName string) error {
	subject := "Ticket Assigned: " + ticketSubject
	body := fmt.Sprintf(`
		<h2>Ticket Assigned</h2>
		<p>A ticket has been assigned to you:</p>
		<p><strong>Subject:</strong> %s</p>
		<p><strong>Ticket ID:</strong> %s</p>
		<p><strong>Assigned to:</strong> %s</p>
		<p>Please check the QuickDesk system to begin working on this ticket.</p>
	`, ticketSubject, ticketID, assigneeName)

	return es.sendEmail(to, subject, body)
}

func (es *EmailService) SendCommentAddedEmail(to, ticketSubject, ticketID, commenterName string) error {
	subject := "New Comment on Ticket: " + ticketSubject
	body := fmt.Sprintf(`
		<h2>New Comment Added</h2>
		<p>A new comment has been added to your ticket:</p>
		<p><strong>Subject:</strong> %s</p>
		<p><strong>Ticket ID:</strong> %s</p>
		<p><strong>Comment by:</strong> %s</p>
		<p>You can view the comment in the QuickDesk system.</p>
	`, ticketSubject, ticketID, commenterName)

	return es.sendEmail(to, subject, body)
}

func (es *EmailService) sendEmail(to, subject, body string) error {
	if es.username == "" || es.password == "" {
		// Email service not configured, skip sending
		return nil
	}

	m := gomail.NewMessage()
	m.SetHeader("From", es.username)
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/html", body)

	d := gomail.NewDialer(es.host, es.port, es.username, es.password)

	return d.DialAndSend(m)
}
