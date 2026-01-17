package com.localhunts.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.from}")
    private String fromEmail;

    /**
     * Send simple text email
     */
    public void sendSimpleEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Send HTML email
     */
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true = HTML content
            
            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Failed to send HTML email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Send OTP email for login
     */
    public void sendOTPEmail(String to, String otp, String userName) {
        String subject = "Your Login OTP - Local Hunt";
        String text = String.format(
            "Hello %s,\n\n" +
            "Your One-Time Password (OTP) for login is: %s\n\n" +
            "This OTP is valid for 10 minutes.\n\n" +
            "If you did not request this OTP, please ignore this email.\n\n" +
            "Best regards,\n" +
            "Local Hunt Team",
            userName != null ? userName : "User",
            otp
        );
        sendSimpleEmail(to, subject, text);
    }

    /**
     * Send order confirmation email
     */
    public void sendOrderConfirmationEmail(String to, String customerName, 
                                           Long orderId, String productName, 
                                           int quantity, double subtotal, 
                                           String paymentMethod, String address, 
                                           String area, String city) {
        String subject = "Order Confirmation - Local Hunt";
        
        String htmlContent = String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<head><meta charset='UTF-8'></head>" +
            "<body style='font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;'>" +
            "<div style='max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;'>" +
            "<h2 style='color: #d32f2f; margin-bottom: 20px;'>Thank You for Your Purchase!</h2>" +
            "<p>Hello %s,</p>" +
            "<p>Your order has been placed successfully. Here are your order details:</p>" +
            "<table style='border-collapse: collapse; width: 100%%; margin: 20px 0; border: 1px solid #ddd;'>" +
            "<tr style='background-color: #f5f5f5;'><th style='border: 1px solid #ddd; padding: 12px; text-align: left;'>Order ID</th><td style='border: 1px solid #ddd; padding: 12px;'>#%d</td></tr>" +
            "<tr><th style='border: 1px solid #ddd; padding: 12px; text-align: left;'>Product</th><td style='border: 1px solid #ddd; padding: 12px;'>%s</td></tr>" +
            "<tr style='background-color: #f5f5f5;'><th style='border: 1px solid #ddd; padding: 12px; text-align: left;'>Quantity</th><td style='border: 1px solid #ddd; padding: 12px;'>%d</td></tr>" +
            "<tr><th style='border: 1px solid #ddd; padding: 12px; text-align: left;'>Total Amount</th><td style='border: 1px solid #ddd; padding: 12px; font-weight: bold; color: #d32f2f;'>NRP %.2f</td></tr>" +
            "<tr style='background-color: #f5f5f5;'><th style='border: 1px solid #ddd; padding: 12px; text-align: left;'>Payment Method</th><td style='border: 1px solid #ddd; padding: 12px;'>%s</td></tr>" +
            "<tr><th style='border: 1px solid #ddd; padding: 12px; text-align: left;'>Delivery Address</th><td style='border: 1px solid #ddd; padding: 12px;'>%s, %s, %s</td></tr>" +
            "</table>" +
            "<p style='margin-top: 20px;'>Your order will be processed shortly. You will receive another email once your order is shipped.</p>" +
            "<p style='margin-top: 20px;'>Best regards,<br><strong>Local Hunt Team</strong></p>" +
            "</div>" +
            "</body></html>",
            customerName,
            orderId,
            productName,
            quantity,
            subtotal,
            paymentMethod != null && paymentMethod.equalsIgnoreCase("esewa") ? "Online (Esewa)" : "Cash on Delivery",
            address,
            area,
            city
        );
        
        sendHtmlEmail(to, subject, htmlContent);
    }
}
