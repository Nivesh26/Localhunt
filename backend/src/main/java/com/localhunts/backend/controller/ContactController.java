package com.localhunts.backend.controller;

import com.localhunts.backend.dto.ContactRequest;
import com.localhunts.backend.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    @Autowired
    private EmailService emailService;

    @Value("${app.admin.email}")
    private String adminEmail;

    @PostMapping
    public ResponseEntity<?> submitContact(@Valid @RequestBody ContactRequest request) {
        try {
            emailService.sendContactMessageToAdmin(
                adminEmail,
                request.getName(),
                request.getEmail(),
                request.getSubject(),
                request.getMessage()
            );
            return ResponseEntity.ok().body("Message sent successfully");
        } catch (Exception e) {
            System.err.println("Contact form send failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to send message. Please try again later.");
        }
    }
}
