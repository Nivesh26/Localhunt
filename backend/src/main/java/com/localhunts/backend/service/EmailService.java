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
        
        String htmlContent = String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<meta charset='UTF-8'>" +
            "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "<style>" +
            "  body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; }" +
            "  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }" +
            "  .header { background: linear-gradient(135deg, #d32f2f 0%%, #f44336 100%%); padding: 40px 20px; text-align: center; }" +
            "  .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }" +
            "  .content { padding: 40px 30px; }" +
            "  .otp-container { background: linear-gradient(135deg, #fff5f5 0%%, #ffe0e0 100%%); border: 2px dashed #d32f2f; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }" +
            "  .otp-code { font-size: 42px; font-weight: 700; letter-spacing: 8px; color: #d32f2f; margin: 15px 0; font-family: 'Courier New', monospace; }" +
            "  .otp-label { font-size: 14px; color: #666666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }" +
            "  .info-box { background-color: #f9f9f9; border-left: 4px solid #d32f2f; padding: 15px 20px; margin: 25px 0; border-radius: 4px; }" +
            "  .info-box p { margin: 5px 0; color: #555555; font-size: 14px; }" +
            "  .button { display: inline-block; background-color: #d32f2f; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }" +
            "  .footer { background-color: #f9f9f9; padding: 30px; text-align: center; color: #666666; font-size: 12px; border-top: 1px solid #e0e0e0; }" +
            "  .footer a { color: #d32f2f; text-decoration: none; }" +
            "  .text-primary { color: #d32f2f; font-weight: 600; }" +
            "</style>" +
            "</head>" +
            "<body>" +
            "<div class='container'>" +
            "  <div class='header'>" +
            "    <h1>🔐 Your Login OTP</h1>" +
            "  </div>" +
            "  <div class='content'>" +
            "    <p style='font-size: 16px; color: #333333; margin: 0 0 20px 0;'>Hello <span class='text-primary'>%s</span>,</p>" +
            "    <p style='font-size: 15px; color: #555555; line-height: 1.6; margin: 0 0 20px 0;'>We've received a request to log in to your Local Hunt account. Use the One-Time Password (OTP) below to complete your login:</p>" +
            "    <div class='otp-container'>" +
            "      <div class='otp-label'>Your OTP Code</div>" +
            "      <div class='otp-code'>%s</div>" +
            "    </div>" +
            "    <div class='info-box'>" +
            "      <p style='margin: 0 0 8px 0;'><strong>⏱️ Valid for:</strong> 10 minutes</p>" +
            "      <p style='margin: 0;'><strong>🔒 Security:</strong> This code will expire after use or timeout</p>" +
            "    </div>" +
            "    <p style='font-size: 14px; color: #777777; line-height: 1.6; margin: 25px 0 10px 0;'><strong>Important:</strong> Never share this OTP with anyone. Local Hunt will never ask for your OTP via email, phone, or any other method.</p>" +
            "    <p style='font-size: 14px; color: #999999; margin: 20px 0 0 0;'>If you didn't request this OTP, please ignore this email or contact our support team if you have concerns.</p>" +
            "  </div>" +
            "  <div class='footer'>" +
            "    <p style='margin: 0 0 10px 0;'><strong>Local Hunt</strong></p>" +
            "    <p style='margin: 0 0 10px 0;'>Your trusted marketplace for authentic Nepali products</p>" +
            "    <p style='margin: 15px 0 0 0; font-size: 11px;'>© 2024 Local Hunt. All rights reserved.</p>" +
            "    <p style='margin: 10px 0 0 0; font-size: 11px;'>This is an automated email. Please do not reply.</p>" +
            "  </div>" +
            "</div>" +
            "</body>" +
            "</html>",
            userName != null ? userName : "User",
            otp
        );
        
        sendHtmlEmail(to, subject, htmlContent);
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
        
        String paymentMethodText = paymentMethod != null && paymentMethod.equalsIgnoreCase("esewa") 
            ? "Online (Esewa)" 
            : "Cash on Delivery";
        
        String htmlContent = String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<meta charset='UTF-8'>" +
            "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "<style>" +
            "  body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; }" +
            "  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }" +
            "  .header { background: linear-gradient(135deg, #d32f2f 0%%, #f44336 100%%); padding: 40px 20px; text-align: center; }" +
            "  .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }" +
            "  .header-icon { font-size: 48px; margin-bottom: 10px; }" +
            "  .content { padding: 40px 30px; }" +
            "  .success-banner { background: linear-gradient(135deg, #e8f5e9 0%%, #c8e6c9 100%%); border-left: 4px solid #4caf50; padding: 20px; margin: 25px 0; border-radius: 6px; }" +
            "  .success-banner p { margin: 0; color: #2e7d32; font-weight: 600; font-size: 16px; }" +
            "  .order-card { background-color: #f9f9f9; border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid #e0e0e0; }" +
            "  .order-details { margin: 20px 0; }" +
            "  .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e0e0; }" +
            "  .detail-row:last-child { border-bottom: none; }" +
            "  .detail-label { color: #666666; font-size: 14px; font-weight: 500; }" +
            "  .detail-value { color: #333333; font-size: 14px; font-weight: 600; text-align: right; }" +
            "  .total-row { background-color: #fff5f5; padding: 15px; border-radius: 8px; margin-top: 15px; }" +
            "  .total-row .detail-value { color: #d32f2f; font-size: 20px; }" +
            "  .address-box { background-color: #f5f5f5; border-left: 3px solid #d32f2f; padding: 15px; margin: 20px 0; border-radius: 4px; }" +
            "  .address-box p { margin: 5px 0; color: #555555; font-size: 14px; line-height: 1.6; }" +
            "  .info-box { background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px 20px; margin: 25px 0; border-radius: 4px; }" +
            "  .info-box p { margin: 5px 0; color: #1565c0; font-size: 14px; }" +
            "  .footer { background-color: #f9f9f9; padding: 30px; text-align: center; color: #666666; font-size: 12px; border-top: 1px solid #e0e0e0; }" +
            "  .footer a { color: #d32f2f; text-decoration: none; }" +
            "  .text-primary { color: #d32f2f; font-weight: 600; }" +
            "  h3 { color: #333333; font-size: 18px; margin: 20px 0 10px 0; }" +
            "</style>" +
            "</head>" +
            "<body>" +
            "<div class='container'>" +
            "  <div class='header'>" +
            "    <div class='header-icon'>✅</div>" +
            "    <h1>Order Confirmed!</h1>" +
            "  </div>" +
            "  <div class='content'>" +
            "    <p style='font-size: 16px; color: #333333; margin: 0 0 20px 0;'>Hello <span class='text-primary'>%s</span>,</p>" +
            "    <div class='success-banner'>" +
            "      <p>🎉 Your order has been placed successfully!</p>" +
            "    </div>" +
            "    <p style='font-size: 15px; color: #555555; line-height: 1.6; margin: 20px 0;'>Thank you for shopping with Local Hunt! We've received your order and it will be processed shortly. Here are your order details:</p>" +
            "    <div class='order-card'>" +
            "      <h3 style='margin-top: 0; color: #d32f2f; border-bottom: 2px solid #d32f2f; padding-bottom: 10px;'>📦 Order Details</h3>" +
            "      <div class='order-details'>" +
            "        <div class='detail-row'>" +
            "          <span class='detail-label'>Order ID</span>" +
            "          <span class='detail-value'>#%d</span>" +
            "        </div>" +
            "        <div class='detail-row'>" +
            "          <span class='detail-label'>Product</span>" +
            "          <span class='detail-value'>%s</span>" +
            "        </div>" +
            "        <div class='detail-row'>" +
            "          <span class='detail-label'>Quantity</span>" +
            "          <span class='detail-value'>%d</span>" +
            "        </div>" +
            "        <div class='detail-row'>" +
            "          <span class='detail-label'>Payment Method</span>" +
            "          <span class='detail-value'>%s</span>" +
            "        </div>" +
            "        <div class='total-row detail-row'>" +
            "          <span class='detail-label'>Total Amount</span>" +
            "          <span class='detail-value'>NRP %.2f</span>" +
            "        </div>" +
            "      </div>" +
            "    </div>" +
            "    <div class='address-box'>" +
            "      <h3 style='margin-top: 0; font-size: 16px; color: #333333;'>📍 Delivery Address</h3>" +
            "      <p><strong>%s</strong></p>" +
            "      <p>%s, %s</p>" +
            "    </div>" +
            "    <div class='info-box'>" +
            "      <p><strong>📬 What's Next?</strong></p>" +
            "      <p style='margin-top: 10px;'>Your order is being prepared and will be shipped soon. You'll receive another email with tracking information once your order is on its way.</p>" +
            "    </div>" +
            "    <p style='font-size: 14px; color: #777777; line-height: 1.6; margin: 25px 0 10px 0;'>If you have any questions about your order, feel free to contact our customer support team. We're here to help!</p>" +
            "  </div>" +
            "  <div class='footer'>" +
            "    <p style='margin: 0 0 10px 0;'><strong style='font-size: 16px; color: #d32f2f;'>Local Hunt</strong></p>" +
            "    <p style='margin: 0 0 10px 0;'>Your trusted marketplace for authentic Nepali products</p>" +
            "    <p style='margin: 15px 0 0 0; font-size: 11px;'>© 2024 Local Hunt. All rights reserved.</p>" +
            "    <p style='margin: 10px 0 0 0; font-size: 11px;'>This is an automated email. Please do not reply.</p>" +
            "  </div>" +
            "</div>" +
            "</body>" +
            "</html>",
            customerName,
            orderId,
            productName,
            quantity,
            paymentMethodText,
            subtotal,
            address != null ? address : "",
            area != null ? area : "",
            city != null ? city : ""
        );
        
        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send welcome email for new user signup
     */
    public void sendUserWelcomeEmail(String to, String userName) {
        String subject = "Welcome to Local Hunt! 🎉";
        
        String htmlContent = String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<meta charset='UTF-8'>" +
            "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "<style>" +
            "  body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; }" +
            "  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }" +
            "  .header { background: linear-gradient(135deg, #d32f2f 0%%, #f44336 100%%); padding: 50px 20px; text-align: center; }" +
            "  .header h1 { color: #ffffff; margin: 0; font-size: 32px; font-weight: 600; }" +
            "  .header-icon { font-size: 64px; margin-bottom: 15px; }" +
            "  .content { padding: 40px 30px; }" +
            "  .welcome-banner { background: linear-gradient(135deg, #e8f5e9 0%%, #c8e6c9 100%%); border-left: 4px solid #4caf50; padding: 25px; margin: 25px 0; border-radius: 8px; }" +
            "  .welcome-banner p { margin: 0; color: #2e7d32; font-weight: 600; font-size: 18px; }" +
            "  .features-box { background-color: #f9f9f9; border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid #e0e0e0; }" +
            "  .feature-item { padding: 12px 0; border-bottom: 1px solid #e0e0e0; display: flex; align-items: flex-start; }" +
            "  .feature-item:last-child { border-bottom: none; }" +
            "  .feature-icon { font-size: 24px; margin-right: 15px; flex-shrink: 0; }" +
            "  .feature-text { flex: 1; }" +
            "  .feature-title { color: #333333; font-size: 16px; font-weight: 600; margin: 0 0 5px 0; }" +
            "  .feature-desc { color: #666666; font-size: 14px; margin: 0; line-height: 1.5; }" +
            "  .cta-button { display: inline-block; background: linear-gradient(135deg, #d32f2f 0%%, #f44336 100%%); color: #ffffff; padding: 16px 35px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 25px 0; font-size: 16px; box-shadow: 0 4px 6px rgba(211, 47, 47, 0.3); }" +
            "  .cta-container { text-align: center; margin: 30px 0; }" +
            "  .footer { background-color: #f9f9f9; padding: 30px; text-align: center; color: #666666; font-size: 12px; border-top: 1px solid #e0e0e0; }" +
            "  .footer a { color: #d32f2f; text-decoration: none; }" +
            "  .text-primary { color: #d32f2f; font-weight: 600; }" +
            "  h3 { color: #333333; font-size: 20px; margin: 25px 0 15px 0; }" +
            "</style>" +
            "</head>" +
            "<body>" +
            "<div class='container'>" +
            "  <div class='header'>" +
            "    <div class='header-icon'>🎉</div>" +
            "    <h1>Welcome to Local Hunt!</h1>" +
            "  </div>" +
            "  <div class='content'>" +
            "    <p style='font-size: 18px; color: #333333; margin: 0 0 20px 0;'>Hello <span class='text-primary'>%s</span>,</p>" +
            "    <div class='welcome-banner'>" +
            "      <p>✨ We're thrilled to have you join our community!</p>" +
            "    </div>" +
            "    <p style='font-size: 15px; color: #555555; line-height: 1.7; margin: 20px 0;'>Thank you for signing up with <strong>Local Hunt</strong>! You've just taken the first step towards discovering authentic Nepali products from trusted local vendors.</p>" +
            "    <div class='features-box'>" +
            "      <h3 style='margin-top: 0; color: #d32f2f; border-bottom: 2px solid #d32f2f; padding-bottom: 10px;'>🚀 What's Next?</h3>" +
            "      <div class='feature-item'>" +
            "        <span class='feature-icon'>🛍️</span>" +
            "        <div class='feature-text'>" +
            "          <div class='feature-title'>Browse Authentic Products</div>" +
            "          <div class='feature-desc'>Explore our curated collection of genuine Nepali products from verified vendors</div>" +
            "        </div>" +
            "      </div>" +
            "      <div class='feature-item'>" +
            "        <span class='feature-icon'>🔒</span>" +
            "        <div class='feature-text'>" +
            "          <div class='feature-title'>Secure Shopping Experience</div>" +
            "          <div class='feature-desc'>Shop with confidence using our secure payment methods and order tracking</div>" +
            "        </div>" +
            "      </div>" +
            "      <div class='feature-item'>" +
            "        <span class='feature-icon'>📦</span>" +
            "        <div class='feature-text'>" +
            "          <div class='feature-title'>Fast & Reliable Delivery</div>" +
            "          <div class='feature-desc'>Get your orders delivered quickly and track them in real-time</div>" +
            "        </div>" +
            "      </div>" +
            "      <div class='feature-item'>" +
            "        <span class='feature-icon'>💬</span>" +
            "        <div class='feature-text'>" +
            "          <div class='feature-title'>Support When You Need It</div>" +
            "          <div class='feature-desc'>Our customer support team is always ready to help you</div>" +
            "        </div>" +
            "      </div>" +
            "    </div>" +
            "    <div class='cta-container'>" +
            "      <a href='#' class='cta-button'>Start Shopping Now →</a>" +
            "    </div>" +
            "    <p style='font-size: 14px; color: #777777; line-height: 1.6; margin: 25px 0 10px 0;'>If you have any questions or need assistance, feel free to reach out to our support team. We're here to help you have the best shopping experience!</p>" +
            "    <p style='font-size: 14px; color: #999999; margin: 20px 0 0 0;'>Happy Shopping!<br><strong>The Local Hunt Team</strong></p>" +
            "  </div>" +
            "  <div class='footer'>" +
            "    <p style='margin: 0 0 10px 0;'><strong style='font-size: 16px; color: #d32f2f;'>Local Hunt</strong></p>" +
            "    <p style='margin: 0 0 10px 0;'>Your trusted marketplace for authentic Nepali products</p>" +
            "    <p style='margin: 15px 0 0 0; font-size: 11px;'>© 2024 Local Hunt. All rights reserved.</p>" +
            "    <p style='margin: 10px 0 0 0; font-size: 11px;'>This is an automated email. Please do not reply.</p>" +
            "  </div>" +
            "</div>" +
            "</body>" +
            "</html>",
            userName != null ? userName : "User"
        );
        
        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send welcome email for new vendor signup
     */
    public void sendVendorWelcomeEmail(String to, String vendorName, String businessName) {
        String subject = "Welcome to Local Hunt Vendor Program! 🎉";
        
        String htmlContent = String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<meta charset='UTF-8'>" +
            "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "<style>" +
            "  body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; }" +
            "  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }" +
            "  .header { background: linear-gradient(135deg, #d32f2f 0%%, #f44336 100%%); padding: 50px 20px; text-align: center; }" +
            "  .header h1 { color: #ffffff; margin: 0; font-size: 32px; font-weight: 600; }" +
            "  .header-icon { font-size: 64px; margin-bottom: 15px; }" +
            "  .content { padding: 40px 30px; }" +
            "  .welcome-banner { background: linear-gradient(135deg, #fff3e0 0%%, #ffe0b2 100%%); border-left: 4px solid #ff9800; padding: 25px; margin: 25px 0; border-radius: 8px; }" +
            "  .welcome-banner p { margin: 0; color: #e65100; font-weight: 600; font-size: 18px; }" +
            "  .pending-notice { background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 20px; margin: 25px 0; border-radius: 8px; }" +
            "  .pending-notice p { margin: 5px 0; color: #e65100; font-size: 14px; line-height: 1.6; }" +
            "  .features-box { background-color: #f9f9f9; border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid #e0e0e0; }" +
            "  .feature-item { padding: 12px 0; border-bottom: 1px solid #e0e0e0; display: flex; align-items: flex-start; }" +
            "  .feature-item:last-child { border-bottom: none; }" +
            "  .feature-icon { font-size: 24px; margin-right: 15px; flex-shrink: 0; }" +
            "  .feature-text { flex: 1; }" +
            "  .feature-title { color: #333333; font-size: 16px; font-weight: 600; margin: 0 0 5px 0; }" +
            "  .feature-desc { color: #666666; font-size: 14px; margin: 0; line-height: 1.5; }" +
            "  .footer { background-color: #f9f9f9; padding: 30px; text-align: center; color: #666666; font-size: 12px; border-top: 1px solid #e0e0e0; }" +
            "  .footer a { color: #d32f2f; text-decoration: none; }" +
            "  .text-primary { color: #d32f2f; font-weight: 600; }" +
            "  h3 { color: #333333; font-size: 20px; margin: 25px 0 15px 0; }" +
            "</style>" +
            "</head>" +
            "<body>" +
            "<div class='container'>" +
            "  <div class='header'>" +
            "    <div class='header-icon'>🎉</div>" +
            "    <h1>Welcome to Local Hunt!</h1>" +
            "  </div>" +
            "  <div class='content'>" +
            "    <p style='font-size: 18px; color: #333333; margin: 0 0 20px 0;'>Hello <span class='text-primary'>%s</span>,</p>" +
            "    <div class='welcome-banner'>" +
            "      <p>✨ Thank you for joining Local Hunt as a Vendor!</p>" +
            "    </div>" +
            "    <p style='font-size: 15px; color: #555555; line-height: 1.7; margin: 20px 0;'>We're excited to have <strong>%s</strong> as part of our vendor community. Local Hunt is dedicated to helping Nepali businesses reach customers and grow their sales.</p>" +
            "    <div class='pending-notice'>" +
            "      <p><strong>📋 Account Status: Pending Approval</strong></p>" +
            "      <p>Your vendor account is currently under review by our admin team. We'll notify you via email once your account has been approved and you can start listing your products.</p>" +
            "      <p style='margin-top: 10px;'><strong>⏱️ Approval Time:</strong> Typically within 24-48 hours</p>" +
            "    </div>" +
            "    <div class='features-box'>" +
            "      <h3 style='margin-top: 0; color: #d32f2f; border-bottom: 2px solid #d32f2f; padding-bottom: 10px;'>🚀 What You Can Do Once Approved:</h3>" +
            "      <div class='feature-item'>" +
            "        <span class='feature-icon'>📦</span>" +
            "        <div class='feature-text'>" +
            "          <div class='feature-title'>List Your Products</div>" +
            "          <div class='feature-desc'>Add your authentic Nepali products with images, descriptions, and competitive pricing</div>" +
            "        </div>" +
            "      </div>" +
            "      <div class='feature-item'>" +
            "        <span class='feature-icon'>📊</span>" +
            "        <div class='feature-text'>" +
            "          <div class='feature-title'>Manage Orders & Inventory</div>" +
            "          <div class='feature-desc'>Track orders, update inventory, and manage your products efficiently</div>" +
            "        </div>" +
            "      </div>" +
            "      <div class='feature-item'>" +
            "        <span class='feature-icon'>💰</span>" +
            "        <div class='feature-text'>" +
            "          <div class='feature-title'>Receive Payments</div>" +
            "          <div class='feature-desc'>Get paid securely for your sales with transparent payout tracking</div>" +
            "        </div>" +
            "      </div>" +
            "      <div class='feature-item'>" +
            "        <span class='feature-icon'>📈</span>" +
            "        <div class='feature-text'>" +
            "          <div class='feature-title'>Grow Your Business</div>" +
            "          <div class='feature-desc'>Reach more customers and expand your market with Local Hunt's platform</div>" +
            "        </div>" +
            "      </div>" +
            "    </div>" +
            "    <p style='font-size: 14px; color: #777777; line-height: 1.6; margin: 25px 0 10px 0;'>If you have any questions about the approval process or need assistance, feel free to contact our vendor support team. We're here to help you succeed!</p>" +
            "    <p style='font-size: 14px; color: #999999; margin: 20px 0 0 0;'>Looking forward to working with you!<br><strong>The Local Hunt Team</strong></p>" +
            "  </div>" +
            "  <div class='footer'>" +
            "    <p style='margin: 0 0 10px 0;'><strong style='font-size: 16px; color: #d32f2f;'>Local Hunt</strong></p>" +
            "    <p style='margin: 0 0 10px 0;'>Your trusted marketplace for authentic Nepali products</p>" +
            "    <p style='margin: 15px 0 0 0; font-size: 11px;'>© 2024 Local Hunt. All rights reserved.</p>" +
            "    <p style='margin: 10px 0 0 0; font-size: 11px;'>This is an automated email. Please do not reply.</p>" +
            "  </div>" +
            "</div>" +
            "</body>" +
            "</html>",
            vendorName != null ? vendorName : "Vendor",
            businessName != null ? businessName : "Your Business"
        );
        
        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send approval notification email to vendor
     */
    public void sendVendorApprovalEmail(String to, String vendorName, String businessName) {
        String subject = "Your Vendor Account Has Been Approved! 🎉";
        
        String htmlContent = String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<meta charset='UTF-8'>" +
            "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "<style>" +
            "  body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; }" +
            "  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }" +
            "  .header { background: linear-gradient(135deg, #4caf50 0%%, #66bb6a 100%%); padding: 50px 20px; text-align: center; }" +
            "  .header h1 { color: #ffffff; margin: 0; font-size: 32px; font-weight: 600; }" +
            "  .header-icon { font-size: 64px; margin-bottom: 15px; }" +
            "  .content { padding: 40px 30px; }" +
            "  .success-banner { background: linear-gradient(135deg, #e8f5e9 0%%, #c8e6c9 100%%); border-left: 4px solid #4caf50; padding: 25px; margin: 25px 0; border-radius: 8px; }" +
            "  .success-banner p { margin: 0; color: #2e7d32; font-weight: 600; font-size: 18px; }" +
            "  .features-box { background-color: #f9f9f9; border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid #e0e0e0; }" +
            "  .feature-item { padding: 12px 0; border-bottom: 1px solid #e0e0e0; display: flex; align-items: flex-start; }" +
            "  .feature-item:last-child { border-bottom: none; }" +
            "  .feature-icon { font-size: 24px; margin-right: 15px; flex-shrink: 0; }" +
            "  .feature-text { flex: 1; }" +
            "  .feature-title { color: #333333; font-size: 16px; font-weight: 600; margin: 0 0 5px 0; }" +
            "  .feature-desc { color: #666666; font-size: 14px; margin: 0; line-height: 1.5; }" +
            "  .cta-button { display: inline-block; background: linear-gradient(135deg, #4caf50 0%%, #66bb6a 100%%); color: #ffffff; padding: 16px 35px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 25px 0; font-size: 16px; box-shadow: 0 4px 6px rgba(76, 175, 80, 0.3); }" +
            "  .cta-container { text-align: center; margin: 30px 0; }" +
            "  .info-box { background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin: 25px 0; border-radius: 8px; }" +
            "  .info-box p { margin: 5px 0; color: #1565c0; font-size: 14px; line-height: 1.6; }" +
            "  .footer { background-color: #f9f9f9; padding: 30px; text-align: center; color: #666666; font-size: 12px; border-top: 1px solid #e0e0e0; }" +
            "  .footer a { color: #4caf50; text-decoration: none; }" +
            "  .text-primary { color: #4caf50; font-weight: 600; }" +
            "  h3 { color: #333333; font-size: 20px; margin: 25px 0 15px 0; }" +
            "</style>" +
            "</head>" +
            "<body>" +
            "<div class='container'>" +
            "  <div class='header'>" +
            "    <div class='header-icon'>✅</div>" +
            "    <h1>Account Approved!</h1>" +
            "  </div>" +
            "  <div class='content'>" +
            "    <p style='font-size: 18px; color: #333333; margin: 0 0 20px 0;'>Hello <span class='text-primary'>%s</span>,</p>" +
            "    <div class='success-banner'>" +
            "      <p>🎉 Great News! Your vendor account has been approved!</p>" +
            "    </div>" +
            "    <p style='font-size: 15px; color: #555555; line-height: 1.7; margin: 20px 0;'>Congratulations! We're excited to inform you that your vendor account for <strong>%s</strong> has been reviewed and approved by our admin team. You can now start listing your products and reaching customers on Local Hunt!</p>" +
            "    <div class='features-box'>" +
            "      <h3 style='margin-top: 0; color: #4caf50; border-bottom: 2px solid #4caf50; padding-bottom: 10px;'>🚀 Get Started Today:</h3>" +
            "      <div class='feature-item'>" +
            "        <span class='feature-icon'>📦</span>" +
            "        <div class='feature-text'>" +
            "          <div class='feature-title'>Add Your Products</div>" +
            "          <div class='feature-desc'>Start listing your authentic Nepali products with high-quality images and detailed descriptions</div>" +
            "        </div>" +
            "      </div>" +
            "      <div class='feature-item'>" +
            "        <span class='feature-icon'>💰</span>" +
            "        <div class='feature-text'>" +
            "          <div class='feature-title'>Set Competitive Prices</div>" +
            "          <div class='feature-desc'>Price your products competitively to attract customers and maximize sales</div>" +
            "        </div>" +
            "      </div>" +
            "      <div class='feature-item'>" +
            "        <span class='feature-icon'>📊</span>" +
            "        <div class='feature-text'>" +
            "          <div class='feature-title'>Manage Inventory</div>" +
            "          <div class='feature-desc'>Track your stock levels and update product availability in real-time</div>" +
            "        </div>" +
            "      </div>" +
            "      <div class='feature-item'>" +
            "        <span class='feature-icon'>📈</span>" +
            "        <div class='feature-text'>" +
            "          <div class='feature-title'>Grow Your Business</div>" +
            "          <div class='feature-desc'>Reach thousands of customers and expand your market presence with Local Hunt</div>" +
            "        </div>" +
            "      </div>" +
            "    </div>" +
            "    <div class='cta-container'>" +
            "      <a href='#' class='cta-button'>Access Your Dashboard →</a>" +
            "    </div>" +
            "    <div class='info-box'>" +
            "      <p><strong>📝 Next Steps:</strong></p>" +
            "      <p style='margin-top: 10px;'>1. Log in to your vendor dashboard</p>" +
            "      <p>2. Complete your business profile</p>" +
            "      <p>3. Start adding your products</p>" +
            "      <p>4. Set up your payment and shipping preferences</p>" +
            "    </div>" +
            "    <p style='font-size: 14px; color: #777777; line-height: 1.6; margin: 25px 0 10px 0;'>If you have any questions or need assistance getting started, our vendor support team is here to help you succeed!</p>" +
            "    <p style='font-size: 14px; color: #999999; margin: 20px 0 0 0;'>Welcome aboard!<br><strong>The Local Hunt Team</strong></p>" +
            "  </div>" +
            "  <div class='footer'>" +
            "    <p style='margin: 0 0 10px 0;'><strong style='font-size: 16px; color: #4caf50;'>Local Hunt</strong></p>" +
            "    <p style='margin: 0 0 10px 0;'>Your trusted marketplace for authentic Nepali products</p>" +
            "    <p style='margin: 15px 0 0 0; font-size: 11px;'>© 2024 Local Hunt. All rights reserved.</p>" +
            "    <p style='margin: 10px 0 0 0; font-size: 11px;'>This is an automated email. Please do not reply.</p>" +
            "  </div>" +
            "</div>" +
            "</body>" +
            "</html>",
            vendorName != null ? vendorName : "Vendor",
            businessName != null ? businessName : "Your Business"
        );
        
        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send store paused notification email to vendor
     */
    public void sendStorePausedEmail(String to, String vendorName, String businessName) {
        String subject = "Store Temporarily Paused - Local Hunt";
        
        String htmlContent = String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<meta charset='UTF-8'>" +
            "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "<style>" +
            "  body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; }" +
            "  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }" +
            "  .header { background: linear-gradient(135deg, #ff9800 0%%, #ff6f00 100%%); padding: 50px 20px; text-align: center; }" +
            "  .header h1 { color: #ffffff; margin: 0; font-size: 32px; font-weight: 600; }" +
            "  .header-icon { font-size: 64px; margin-bottom: 15px; }" +
            "  .content { padding: 40px 30px; }" +
            "  .notice-banner { background: linear-gradient(135deg, #fff3e0 0%%, #ffe0b2 100%%); border-left: 4px solid #ff9800; padding: 25px; margin: 25px 0; border-radius: 8px; }" +
            "  .notice-banner p { margin: 0; color: #e65100; font-weight: 600; font-size: 18px; }" +
            "  .info-box { background-color: #f9f9f9; border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid #e0e0e0; }" +
            "  .info-item { padding: 12px 0; border-bottom: 1px solid #e0e0e0; display: flex; align-items: flex-start; }" +
            "  .info-item:last-child { border-bottom: none; }" +
            "  .info-icon { font-size: 24px; margin-right: 15px; flex-shrink: 0; }" +
            "  .info-text { flex: 1; }" +
            "  .info-title { color: #333333; font-size: 16px; font-weight: 600; margin: 0 0 5px 0; }" +
            "  .info-desc { color: #666666; font-size: 14px; margin: 0; line-height: 1.5; }" +
            "  .cta-button { display: inline-block; background: linear-gradient(135deg, #ff9800 0%%, #ff6f00 100%%); color: #ffffff; padding: 16px 35px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 25px 0; font-size: 16px; box-shadow: 0 4px 6px rgba(255, 152, 0, 0.3); }" +
            "  .cta-container { text-align: center; margin: 30px 0; }" +
            "  .footer { background-color: #f9f9f9; padding: 30px; text-align: center; color: #666666; font-size: 12px; border-top: 1px solid #e0e0e0; }" +
            "  .footer a { color: #ff9800; text-decoration: none; }" +
            "  .text-primary { color: #ff9800; font-weight: 600; }" +
            "  h3 { color: #333333; font-size: 20px; margin: 25px 0 15px 0; }" +
            "</style>" +
            "</head>" +
            "<body>" +
            "<div class='container'>" +
            "  <div class='header'>" +
            "    <div class='header-icon'>⏸️</div>" +
            "    <h1>Store Paused</h1>" +
            "  </div>" +
            "  <div class='content'>" +
            "    <p style='font-size: 18px; color: #333333; margin: 0 0 20px 0;'>Hello <span class='text-primary'>%s</span>,</p>" +
            "    <div class='notice-banner'>" +
            "      <p>⚠️ Your store has been temporarily paused</p>" +
            "    </div>" +
            "    <p style='font-size: 15px; color: #555555; line-height: 1.7; margin: 20px 0;'>This is to inform you that your store <strong>%s</strong> on Local Hunt has been temporarily paused. While your store is paused, customers will not be able to view or purchase your products.</p>" +
            "    <div class='info-box'>" +
            "      <h3 style='margin-top: 0; color: #ff9800; border-bottom: 2px solid #ff9800; padding-bottom: 10px;'>📋 What This Means:</h3>" +
            "      <div class='info-item'>" +
            "        <span class='info-icon'>🚫</span>" +
            "        <div class='info-text'>" +
            "          <div class='info-title'>Products Hidden</div>" +
            "          <div class='info-desc'>Your products will not be visible to customers in the marketplace</div>" +
            "        </div>" +
            "      </div>" +
            "      <div class='info-item'>" +
            "        <span class='info-icon'>💰</span>" +
            "        <div class='info-text'>" +
            "          <div class='info-title'>No New Orders</div>" +
            "          <div class='info-desc'>Customers cannot place new orders while your store is paused</div>" +
            "        </div>" +
            "      </div>" +
            "      <div class='info-item'>" +
            "        <span class='info-icon'>📊</span>" +
            "        <div class='info-text'>" +
            "          <div class='info-title'>Existing Orders</div>" +
            "          <div class='info-desc'>Existing orders will still be processed and tracked normally</div>" +
            "        </div>" +
            "      </div>" +
            "      <div class='info-item'>" +
            "        <span class='info-icon'>✅</span>" +
            "        <div class='info-text'>" +
            "          <div class='info-title'>Easy to Resume</div>" +
            "          <div class='info-desc'>You can resume your store anytime from your vendor dashboard</div>" +
            "        </div>" +
            "      </div>" +
            "    </div>" +
            "    <div class='cta-container'>" +
            "      <a href='#' class='cta-button'>Resume Your Store →</a>" +
            "    </div>" +
            "    <p style='font-size: 14px; color: #777777; line-height: 1.6; margin: 25px 0 10px 0;'>If you have any questions or need assistance, our vendor support team is here to help!</p>" +
            "    <p style='font-size: 14px; color: #999999; margin: 20px 0 0 0;'>Best regards,<br><strong>The Local Hunt Team</strong></p>" +
            "  </div>" +
            "  <div class='footer'>" +
            "    <p style='margin: 0 0 10px 0;'><strong style='font-size: 16px; color: #ff9800;'>Local Hunt</strong></p>" +
            "    <p style='margin: 0 0 10px 0;'>Your trusted marketplace for authentic Nepali products</p>" +
            "    <p style='margin: 15px 0 0 0; font-size: 11px;'>© 2024 Local Hunt. All rights reserved.</p>" +
            "    <p style='margin: 10px 0 0 0; font-size: 11px;'>This is an automated email. Please do not reply.</p>" +
            "  </div>" +
            "</div>" +
            "</body>" +
            "</html>",
            vendorName != null ? vendorName : "Vendor",
            businessName != null ? businessName : "Your Store"
        );
        
        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send store resumed notification email to vendor
     */
    public void sendStoreResumedEmail(String to, String vendorName, String businessName) {
        String subject = "Store is Now Live! 🎉 - Local Hunt";
        
        String htmlContent = String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<meta charset='UTF-8'>" +
            "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "<style>" +
            "  body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; }" +
            "  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }" +
            "  .header { background: linear-gradient(135deg, #4caf50 0%%, #66bb6a 100%%); padding: 50px 20px; text-align: center; }" +
            "  .header h1 { color: #ffffff; margin: 0; font-size: 32px; font-weight: 600; }" +
            "  .header-icon { font-size: 64px; margin-bottom: 15px; }" +
            "  .content { padding: 40px 30px; }" +
            "  .success-banner { background: linear-gradient(135deg, #e8f5e9 0%%, #c8e6c9 100%%); border-left: 4px solid #4caf50; padding: 25px; margin: 25px 0; border-radius: 8px; }" +
            "  .success-banner p { margin: 0; color: #2e7d32; font-weight: 600; font-size: 18px; }" +
            "  .info-box { background-color: #f9f9f9; border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid #e0e0e0; }" +
            "  .info-item { padding: 12px 0; border-bottom: 1px solid #e0e0e0; display: flex; align-items: flex-start; }" +
            "  .info-item:last-child { border-bottom: none; }" +
            "  .info-icon { font-size: 24px; margin-right: 15px; flex-shrink: 0; }" +
            "  .info-text { flex: 1; }" +
            "  .info-title { color: #333333; font-size: 16px; font-weight: 600; margin: 0 0 5px 0; }" +
            "  .info-desc { color: #666666; font-size: 14px; margin: 0; line-height: 1.5; }" +
            "  .cta-button { display: inline-block; background: linear-gradient(135deg, #4caf50 0%%, #66bb6a 100%%); color: #ffffff; padding: 16px 35px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 25px 0; font-size: 16px; box-shadow: 0 4px 6px rgba(76, 175, 80, 0.3); }" +
            "  .cta-container { text-align: center; margin: 30px 0; }" +
            "  .footer { background-color: #f9f9f9; padding: 30px; text-align: center; color: #666666; font-size: 12px; border-top: 1px solid #e0e0e0; }" +
            "  .footer a { color: #4caf50; text-decoration: none; }" +
            "  .text-primary { color: #4caf50; font-weight: 600; }" +
            "  h3 { color: #333333; font-size: 20px; margin: 25px 0 15px 0; }" +
            "</style>" +
            "</head>" +
            "<body>" +
            "<div class='container'>" +
            "  <div class='header'>" +
            "    <div class='header-icon'>✅</div>" +
            "    <h1>Store is Live!</h1>" +
            "  </div>" +
            "  <div class='content'>" +
            "    <p style='font-size: 18px; color: #333333; margin: 0 0 20px 0;'>Hello <span class='text-primary'>%s</span>,</p>" +
            "    <div class='success-banner'>" +
            "      <p>🎉 Great news! Your store is now live and open for business!</p>" +
            "    </div>" +
            "    <p style='font-size: 15px; color: #555555; line-height: 1.7; margin: 20px 0;'>We're excited to let you know that your store <strong>%s</strong> on Local Hunt has been resumed and is now live. Your products are visible to customers and they can now place orders!</p>" +
            "    <div class='info-box'>" +
            "      <h3 style='margin-top: 0; color: #4caf50; border-bottom: 2px solid #4caf50; padding-bottom: 10px;'>🚀 What's Active Now:</h3>" +
            "      <div class='info-item'>" +
            "        <span class='info-icon'>🛍️</span>" +
            "        <div class='info-text'>" +
            "          <div class='info-title'>Products Visible</div>" +
            "          <div class='info-desc'>All your products are now visible to customers in the marketplace</div>" +
            "        </div>" +
            "      </div>" +
            "      <div class='info-item'>" +
            "        <span class='info-icon'>💰</span>" +
            "        <div class='info-text'>" +
            "          <div class='info-title'>Orders Enabled</div>" +
            "          <div class='info-desc'>Customers can now browse and place orders for your products</div>" +
            "        </div>" +
            "      </div>" +
            "      <div class='info-item'>" +
            "        <span class='info-icon'>📊</span>" +
            "        <div class='info-text'>" +
            "          <div class='info-title'>Full Dashboard Access</div>" +
            "          <div class='info-desc'>Manage orders, inventory, and track your sales performance</div>" +
            "        </div>" +
            "      </div>" +
            "      <div class='info-item'>" +
            "        <span class='info-icon'>📈</span>" +
            "        <div class='info-text'>" +
            "          <div class='info-title'>Business Growth</div>" +
            "          <div class='info-desc'>Start receiving orders and growing your business on Local Hunt</div>" +
            "        </div>" +
            "      </div>" +
            "    </div>" +
            "    <div class='cta-container'>" +
            "      <a href='#' class='cta-button'>View Your Dashboard →</a>" +
            "    </div>" +
            "    <p style='font-size: 14px; color: #777777; line-height: 1.6; margin: 25px 0 10px 0;'>If you have any questions or need assistance, our vendor support team is here to help you succeed!</p>" +
            "    <p style='font-size: 14px; color: #999999; margin: 20px 0 0 0;'>Happy selling!<br><strong>The Local Hunt Team</strong></p>" +
            "  </div>" +
            "  <div class='footer'>" +
            "    <p style='margin: 0 0 10px 0;'><strong style='font-size: 16px; color: #4caf50;'>Local Hunt</strong></p>" +
            "    <p style='margin: 0 0 10px 0;'>Your trusted marketplace for authentic Nepali products</p>" +
            "    <p style='margin: 15px 0 0 0; font-size: 11px;'>© 2024 Local Hunt. All rights reserved.</p>" +
            "    <p style='margin: 10px 0 0 0; font-size: 11px;'>This is an automated email. Please do not reply.</p>" +
            "  </div>" +
            "</div>" +
            "</body>" +
            "</html>",
            vendorName != null ? vendorName : "Vendor",
            businessName != null ? businessName : "Your Store"
        );
        
        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send "Ready to ship" notification email to user
     */
    public void sendReadyToShipEmail(String to, String customerName, Long orderId, 
                                     String productName, String address, String area, String city) {
        String subject = "Your Order is Ready to Ship! 📦 - Local Hunt";
        
        String htmlContent = String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<meta charset='UTF-8'>" +
            "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "<style>" +
            "  body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; }" +
            "  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }" +
            "  .header { background: linear-gradient(135deg, #ff9800 0%%, #ff6f00 100%%); padding: 50px 20px; text-align: center; }" +
            "  .header h1 { color: #ffffff; margin: 0; font-size: 32px; font-weight: 600; }" +
            "  .header-icon { font-size: 64px; margin-bottom: 15px; }" +
            "  .content { padding: 40px 30px; }" +
            "  .success-banner { background: linear-gradient(135deg, #fff3e0 0%%, #ffe0b2 100%%); border-left: 4px solid #ff9800; padding: 25px; margin: 25px 0; border-radius: 8px; }" +
            "  .success-banner p { margin: 0; color: #e65100; font-weight: 600; font-size: 18px; }" +
            "  .info-box { background-color: #f9f9f9; border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid #e0e0e0; }" +
            "  .info-item { padding: 12px 0; border-bottom: 1px solid #e0e0e0; display: flex; align-items: flex-start; }" +
            "  .info-item:last-child { border-bottom: none; }" +
            "  .info-icon { font-size: 24px; margin-right: 15px; flex-shrink: 0; }" +
            "  .info-text { flex: 1; }" +
            "  .info-title { color: #333333; font-size: 16px; font-weight: 600; margin: 0 0 5px 0; }" +
            "  .info-desc { color: #666666; font-size: 14px; margin: 0; line-height: 1.5; }" +
            "  .address-box { background-color: #f5f5f5; border-left: 3px solid #ff9800; padding: 15px; margin: 20px 0; border-radius: 4px; }" +
            "  .address-box p { margin: 5px 0; color: #555555; font-size: 14px; line-height: 1.6; }" +
            "  .footer { background-color: #f9f9f9; padding: 30px; text-align: center; color: #666666; font-size: 12px; border-top: 1px solid #e0e0e0; }" +
            "  .footer a { color: #ff9800; text-decoration: none; }" +
            "  .text-primary { color: #ff9800; font-weight: 600; }" +
            "  h3 { color: #333333; font-size: 20px; margin: 25px 0 15px 0; }" +
            "</style>" +
            "</head>" +
            "<body>" +
            "<div class='container'>" +
            "  <div class='header'>" +
            "    <div class='header-icon'>📦</div>" +
            "    <h1>Ready to Ship!</h1>" +
            "  </div>" +
            "  <div class='content'>" +
            "    <p style='font-size: 18px; color: #333333; margin: 0 0 20px 0;'>Hello <span class='text-primary'>%s</span>,</p>" +
            "    <div class='success-banner'>" +
            "      <p>🚀 Great news! Your order is ready to ship!</p>" +
            "    </div>" +
            "    <p style='font-size: 15px; color: #555555; line-height: 1.7; margin: 20px 0;'>We're excited to let you know that your order <strong>#%d</strong> for <strong>%s</strong> is now ready to ship! Our team has prepared your order and it will be dispatched soon.</p>" +
            "    <div class='info-box'>" +
            "      <h3 style='margin-top: 0; color: #ff9800; border-bottom: 2px solid #ff9800; padding-bottom: 10px;'>📋 What's Next:</h3>" +
            "      <div class='info-item'>" +
            "        <span class='info-icon'>🚚</span>" +
            "        <div class='info-text'>" +
            "          <div class='info-title'>Shipping Soon</div>" +
            "          <div class='info-desc'>Your order will be shipped within 24 hours</div>" +
            "        </div>" +
            "      </div>" +
            "      <div class='info-item'>" +
            "        <span class='info-icon'>📧</span>" +
            "        <div class='info-text'>" +
            "          <div class='info-title'>Tracking Information</div>" +
            "          <div class='info-desc'>You'll receive another email with tracking details once your order is shipped</div>" +
            "        </div>" +
            "      </div>" +
            "      <div class='info-item'>" +
            "        <span class='info-icon'>📍</span>" +
            "        <div class='info-text'>" +
            "          <div class='info-title'>Delivery Address</div>" +
            "          <div class='info-desc'>Your order will be delivered to the address provided</div>" +
            "        </div>" +
            "      </div>" +
            "    </div>" +
            "    <div class='address-box'>" +
            "      <h3 style='margin-top: 0; font-size: 16px; color: #333333;'>📍 Delivery Address</h3>" +
            "      <p><strong>%s</strong></p>" +
            "      <p>%s, %s</p>" +
            "    </div>" +
            "    <p style='font-size: 14px; color: #777777; line-height: 1.6; margin: 25px 0 10px 0;'>If you have any questions about your order, feel free to contact our customer support team. We're here to help!</p>" +
            "    <p style='font-size: 14px; color: #999999; margin: 20px 0 0 0;'>Thank you for shopping with us!<br><strong>The Local Hunt Team</strong></p>" +
            "  </div>" +
            "  <div class='footer'>" +
            "    <p style='margin: 0 0 10px 0;'><strong style='font-size: 16px; color: #ff9800;'>Local Hunt</strong></p>" +
            "    <p style='margin: 0 0 10px 0;'>Your trusted marketplace for authentic Nepali products</p>" +
            "    <p style='margin: 15px 0 0 0; font-size: 11px;'>© 2024 Local Hunt. All rights reserved.</p>" +
            "    <p style='margin: 10px 0 0 0; font-size: 11px;'>This is an automated email. Please do not reply.</p>" +
            "  </div>" +
            "</div>" +
            "</body>" +
            "</html>",
            customerName != null ? customerName : "Customer",
            orderId,
            productName != null ? productName : "your product",
            address != null ? address : "",
            area != null ? area : "",
            city != null ? city : ""
        );
        
        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send "Delivered" notification email to user
     */
    public void sendDeliveredEmail(String to, String customerName, Long orderId, 
                                   String productName, String address, String area, String city) {
        String subject = "Your Order Has Been Delivered! ✅ - Local Hunt";
        
        String htmlContent = String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<meta charset='UTF-8'>" +
            "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "<style>" +
            "  body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; }" +
            "  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }" +
            "  .header { background: linear-gradient(135deg, #4caf50 0%%, #66bb6a 100%%); padding: 50px 20px; text-align: center; }" +
            "  .header h1 { color: #ffffff; margin: 0; font-size: 32px; font-weight: 600; }" +
            "  .header-icon { font-size: 64px; margin-bottom: 15px; }" +
            "  .content { padding: 40px 30px; }" +
            "  .success-banner { background: linear-gradient(135deg, #e8f5e9 0%%, #c8e6c9 100%%); border-left: 4px solid #4caf50; padding: 25px; margin: 25px 0; border-radius: 8px; }" +
            "  .success-banner p { margin: 0; color: #2e7d32; font-weight: 600; font-size: 18px; }" +
            "  .info-box { background-color: #f9f9f9; border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid #e0e0e0; }" +
            "  .info-item { padding: 12px 0; border-bottom: 1px solid #e0e0e0; display: flex; align-items: flex-start; }" +
            "  .info-item:last-child { border-bottom: none; }" +
            "  .info-icon { font-size: 24px; margin-right: 15px; flex-shrink: 0; }" +
            "  .info-text { flex: 1; }" +
            "  .info-title { color: #333333; font-size: 16px; font-weight: 600; margin: 0 0 5px 0; }" +
            "  .info-desc { color: #666666; font-size: 14px; margin: 0; line-height: 1.5; }" +
            "  .address-box { background-color: #f5f5f5; border-left: 3px solid #4caf50; padding: 15px; margin: 20px 0; border-radius: 4px; }" +
            "  .address-box p { margin: 5px 0; color: #555555; font-size: 14px; line-height: 1.6; }" +
            "  .footer { background-color: #f9f9f9; padding: 30px; text-align: center; color: #666666; font-size: 12px; border-top: 1px solid #e0e0e0; }" +
            "  .footer a { color: #4caf50; text-decoration: none; }" +
            "  .text-primary { color: #4caf50; font-weight: 600; }" +
            "  h3 { color: #333333; font-size: 20px; margin: 25px 0 15px 0; }" +
            "</style>" +
            "</head>" +
            "<body>" +
            "<div class='container'>" +
            "  <div class='header'>" +
            "    <div class='header-icon'>✅</div>" +
            "    <h1>Order Delivered!</h1>" +
            "  </div>" +
            "  <div class='content'>" +
            "    <p style='font-size: 18px; color: #333333; margin: 0 0 20px 0;'>Hello <span class='text-primary'>%s</span>,</p>" +
            "    <div class='success-banner'>" +
            "      <p>🎉 Congratulations! Your order has been delivered!</p>" +
            "    </div>" +
            "    <p style='font-size: 15px; color: #555555; line-height: 1.7; margin: 20px 0;'>We're thrilled to inform you that your order <strong>#%d</strong> for <strong>%s</strong> has been successfully delivered to your address. We hope you love your purchase!</p>" +
            "    <div class='info-box'>" +
            "      <h3 style='margin-top: 0; color: #4caf50; border-bottom: 2px solid #4caf50; padding-bottom: 10px;'>📋 What's Next:</h3>" +
            "      <div class='info-item'>" +
            "        <span class='info-icon'>📦</span>" +
            "        <div class='info-text'>" +
            "          <div class='info-title'>Check Your Order</div>" +
            "          <div class='info-desc'>Please inspect your package to ensure everything arrived in good condition</div>" +
            "        </div>" +
            "      </div>" +
            "      <div class='info-item'>" +
            "        <span class='info-icon'>⭐</span>" +
            "        <div class='info-text'>" +
            "          <div class='info-title'>Leave a Review</div>" +
            "          <div class='info-desc'>We'd love to hear about your experience! Share your feedback with other customers</div>" +
            "        </div>" +
            "      </div>" +
            "      <div class='info-item'>" +
            "        <span class='info-icon'>🔄</span>" +
            "        <div class='info-text'>" +
            "          <div class='info-title'>Need Help?</div>" +
            "          <div class='info-desc'>If you have any issues or concerns, our customer support team is ready to assist you</div>" +
            "        </div>" +
            "      </div>" +
            "    </div>" +
            "    <div class='address-box'>" +
            "      <h3 style='margin-top: 0; font-size: 16px; color: #333333;'>📍 Delivery Address</h3>" +
            "      <p><strong>%s</strong></p>" +
            "      <p>%s, %s</p>" +
            "    </div>" +
            "    <p style='font-size: 14px; color: #777777; line-height: 1.6; margin: 25px 0 10px 0;'>Thank you for choosing Local Hunt! We appreciate your business and hope you enjoy your authentic Nepali products.</p>" +
            "    <p style='font-size: 14px; color: #999999; margin: 20px 0 0 0;'>Happy shopping!<br><strong>The Local Hunt Team</strong></p>" +
            "  </div>" +
            "  <div class='footer'>" +
            "    <p style='margin: 0 0 10px 0;'><strong style='font-size: 16px; color: #4caf50;'>Local Hunt</strong></p>" +
            "    <p style='margin: 0 0 10px 0;'>Your trusted marketplace for authentic Nepali products</p>" +
            "    <p style='margin: 15px 0 0 0; font-size: 11px;'>© 2024 Local Hunt. All rights reserved.</p>" +
            "    <p style='margin: 10px 0 0 0; font-size: 11px;'>This is an automated email. Please do not reply.</p>" +
            "  </div>" +
            "</div>" +
            "</body>" +
            "</html>",
            customerName != null ? customerName : "Customer",
            orderId,
            productName != null ? productName : "your product",
            address != null ? address : "",
            area != null ? area : "",
            city != null ? city : ""
        );
        
        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send order cancelled email to customer (user)
     */
    public void sendOrderCancelledEmailToCustomer(String to, String customerName, Long orderId,
                                                   String productName, String address, String area, String city) {
        String subject = "Order Cancelled - Local Hunt";
        String htmlContent = String.format(
            "<!DOCTYPE html>" +
            "<html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "<style>body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5}.container{max-width:600px;margin:0 auto;background:#fff}.header{background:linear-gradient(135deg,#9e9e9e 0%%,#757575 100%%);padding:40px 20px;text-align:center}.header h1{color:#fff;margin:0;font-size:28px;font-weight:600}.content{padding:40px 30px}.banner{background:#ffebee;border-left:4px solid #d32f2f;padding:20px;margin:25px 0;border-radius:8px}.banner p{margin:0;color:#c62828;font-weight:600;font-size:16px}.info-box{background:#f9f9f9;border-radius:8px;padding:20px;margin:20px 0}.info-box p{margin:5px 0;color:#555;font-size:14px}.footer{background:#f9f9f9;padding:30px;text-align:center;color:#666;font-size:12px;border-top:1px solid #e0e0e0}.text-primary{color:#d32f2f;font-weight:600}</style>" +
            "</head><body><div class='container'>" +
            "<div class='header'><h1>Order Cancelled</h1></div>" +
            "<div class='content'>" +
            "<p style='font-size:16px;color:#333;margin:0 0 20px 0;'>Hello <span class='text-primary'>%s</span>,</p>" +
            "<div class='banner'><p>Your order has been cancelled.</p></div>" +
            "<p style='font-size:15px;color:#555;line-height:1.6;'>Order <strong>#%d</strong> for <strong>%s</strong> was cancelled as per your request.</p>" +
            "<div class='info-box'><p><strong>Delivery address:</strong> %s, %s, %s</p></div>" +
            "<p style='font-size:14px;color:#777;'>If you did not request this cancellation, please contact our support team.</p>" +
            "</div>" +
            "<div class='footer'><p><strong>Local Hunt</strong></p><p>Your trusted marketplace for authentic Nepali products</p></div>" +
            "</div></body></html>",
            customerName != null ? customerName : "Customer",
            orderId,
            productName != null ? productName : "your product",
            address != null ? address : "",
            area != null ? area : "",
            city != null ? city : ""
        );
        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send order cancelled email to vendor (seller)
     */
    /**
     * Send email to vendor when they remove a cancelled order from their list
     */
    public void sendVendorCancelledOrderRemovedEmail(String to, String vendorName, Long orderId, String productName) {
        String subject = "Cancelled order removed from your list - Local Hunt";
        String htmlContent = String.format(
            "<!DOCTYPE html>" +
            "<html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "<style>body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5}.container{max-width:600px;margin:0 auto;background:#fff}.header{background:linear-gradient(135deg,#4caf50 0%%,#66bb6a 100%%);padding:40px 20px;text-align:center}.header h1{color:#fff;margin:0;font-size:28px;font-weight:600}.content{padding:40px 30px}.banner{background:#e8f5e9;border-left:4px solid #4caf50;padding:20px;margin:25px 0;border-radius:8px}.banner p{margin:0;color:#2e7d32;font-weight:600;font-size:16px}.footer{background:#f9f9f9;padding:30px;text-align:center;color:#666;font-size:12px;border-top:1px solid #e0e0e0}.text-primary{color:#d32f2f;font-weight:600}</style>" +
            "</head><body><div class='container'>" +
            "<div class='header'><h1>Order removed</h1></div>" +
            "<div class='content'>" +
            "<p style='font-size:16px;color:#333;margin:0 0 20px 0;'>Hello <span class='text-primary'>%s</span>,</p>" +
            "<div class='banner'><p>Cancelled order #%d (%s) has been removed from your order list.</p></div>" +
            "<p style='font-size:15px;color:#555;line-height:1.6;'>You will no longer see this order in your seller dashboard.</p>" +
            "</div>" +
            "<div class='footer'><p><strong>Local Hunt</strong></p><p>Your trusted marketplace for authentic Nepali products</p></div>" +
            "</div></body></html>",
            vendorName != null ? vendorName : "Vendor",
            orderId,
            productName != null ? productName : "Product"
        );
        sendHtmlEmail(to, subject, htmlContent);
    }

    public void sendOrderCancelledEmailToVendor(String to, String vendorName, Long orderId,
                                                String productName, String customerName) {
        String subject = "Order Cancelled by Customer - Local Hunt";
        String htmlContent = String.format(
            "<!DOCTYPE html>" +
            "<html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "<style>body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5}.container{max-width:600px;margin:0 auto;background:#fff}.header{background:linear-gradient(135deg,#9e9e9e 0%%,#757575 100%%);padding:40px 20px;text-align:center}.header h1{color:#fff;margin:0;font-size:28px;font-weight:600}.content{padding:40px 30px}.banner{background:#ffebee;border-left:4px solid #d32f2f;padding:20px;margin:25px 0;border-radius:8px}.banner p{margin:0;color:#c62828;font-weight:600;font-size:16px}.info-box{background:#f9f9f9;border-radius:8px;padding:20px;margin:20px 0}.info-box p{margin:5px 0;color:#555;font-size:14px}.footer{background:#f9f9f9;padding:30px;text-align:center;color:#666;font-size:12px;border-top:1px solid #e0e0e0}.text-primary{color:#d32f2f;font-weight:600}</style>" +
            "</head><body><div class='container'>" +
            "<div class='header'><h1>Order Cancelled</h1></div>" +
            "<div class='content'>" +
            "<p style='font-size:16px;color:#333;margin:0 0 20px 0;'>Hello <span class='text-primary'>%s</span>,</p>" +
            "<div class='banner'><p>A customer has cancelled their order.</p></div>" +
            "<p style='font-size:15px;color:#555;line-height:1.6;'>Order <strong>#%d</strong> for <strong>%s</strong> was cancelled by customer <strong>%s</strong>. Stock for this product has been restored.</p>" +
            "<div class='info-box'><p>No action is required. You can ignore this order in your pending list.</p></div>" +
            "</div>" +
            "<div class='footer'><p><strong>Local Hunt</strong></p><p>Your trusted marketplace for authentic Nepali products</p></div>" +
            "</div></body></html>",
            vendorName != null ? vendorName : "Vendor",
            orderId,
            productName != null ? productName : "Product",
            customerName != null ? customerName : "Customer"
        );
        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send password reset OTP email
     */
    public void sendPasswordResetOTPEmail(String to, String otp, String userName) {
        String subject = "Password Reset OTP - Local Hunt";
        
        String htmlContent = String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<meta charset='UTF-8'>" +
            "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "<style>" +
            "  body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; }" +
            "  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }" +
            "  .header { background: linear-gradient(135deg, #d32f2f 0%%, #f44336 100%%); padding: 40px 20px; text-align: center; }" +
            "  .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }" +
            "  .content { padding: 40px 30px; }" +
            "  .otp-container { background: linear-gradient(135deg, #fff5f5 0%%, #ffe0e0 100%%); border: 2px dashed #d32f2f; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }" +
            "  .otp-code { font-size: 42px; font-weight: 700; letter-spacing: 8px; color: #d32f2f; margin: 15px 0; font-family: 'Courier New', monospace; }" +
            "  .otp-label { font-size: 14px; color: #666666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }" +
            "  .info-box { background-color: #f9f9f9; border-left: 4px solid #d32f2f; padding: 15px 20px; margin: 25px 0; border-radius: 4px; }" +
            "  .info-box p { margin: 5px 0; color: #555555; font-size: 14px; }" +
            "  .footer { background-color: #f9f9f9; padding: 30px; text-align: center; color: #666666; font-size: 12px; border-top: 1px solid #e0e0e0; }" +
            "  .footer a { color: #d32f2f; text-decoration: none; }" +
            "  .text-primary { color: #d32f2f; font-weight: 600; }" +
            "</style>" +
            "</head>" +
            "<body>" +
            "<div class='container'>" +
            "  <div class='header'>" +
            "    <h1>🔐 Password Reset Request</h1>" +
            "  </div>" +
            "  <div class='content'>" +
            "    <p style='font-size: 16px; color: #333333; margin: 0 0 20px 0;'>Hello <span class='text-primary'>%s</span>,</p>" +
            "    <p style='font-size: 15px; color: #555555; line-height: 1.6; margin: 0 0 20px 0;'>We've received a request to reset your password. Use the One-Time Password (OTP) below to reset your password:</p>" +
            "    <div class='otp-container'>" +
            "      <div class='otp-label'>Your Password Reset OTP</div>" +
            "      <div class='otp-code'>%s</div>" +
            "    </div>" +
            "    <div class='info-box'>" +
            "      <p style='margin: 0 0 8px 0;'><strong>⏱️ Valid for:</strong> 10 minutes</p>" +
            "      <p style='margin: 0;'><strong>🔒 Security:</strong> This code will expire after use or timeout</p>" +
            "    </div>" +
            "    <p style='font-size: 14px; color: #777777; line-height: 1.6; margin: 25px 0 10px 0;'><strong>Important:</strong> Never share this OTP with anyone. Local Hunt will never ask for your OTP via email, phone, or any other method.</p>" +
            "    <p style='font-size: 14px; color: #999999; margin: 20px 0 0 0;'>If you didn't request a password reset, please ignore this email or contact our support team if you have concerns.</p>" +
            "  </div>" +
            "  <div class='footer'>" +
            "    <p style='margin: 0 0 10px 0;'><strong>Local Hunt</strong></p>" +
            "    <p style='margin: 0 0 10px 0;'>Your trusted marketplace for authentic Nepali products</p>" +
            "    <p style='margin: 15px 0 0 0; font-size: 11px;'>© 2024 Local Hunt. All rights reserved.</p>" +
            "    <p style='margin: 10px 0 0 0; font-size: 11px;'>This is an automated email. Please do not reply.</p>" +
            "  </div>" +
            "</div>" +
            "</body>" +
            "</html>",
            userName != null ? userName : "User",
            otp
        );
        
        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send delivery address updated email to user (customer)
     */
    public void sendDeliveryAddressUpdatedEmail(String to, String fullName, String address, String area, String city, String region) {
        String subject = "Delivery Address Updated - Local Hunt";
        String htmlContent = String.format(
            "<!DOCTYPE html>" +
            "<html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "<style>body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5}.container{max-width:600px;margin:0 auto;background:#fff}.header{background:linear-gradient(135deg,#d32f2f 0%%,#f44336 100%%);padding:40px 20px;text-align:center}.header h1{color:#fff;margin:0;font-size:28px;font-weight:600}.content{padding:40px 30px}.success-banner{background:linear-gradient(135deg,#e8f5e9 0%%,#c8e6c9 100%%);border-left:4px solid #4caf50;padding:20px;margin:25px 0;border-radius:8px}.success-banner p{margin:0;color:#2e7d32;font-weight:600;font-size:16px}.address-box{background:#f9f9f9;border-left:4px solid #d32f2f;padding:15px 20px;margin:20px 0;border-radius:4px}.address-box p{margin:5px 0;color:#555;font-size:14px;line-height:1.5}.footer{background:#f9f9f9;padding:30px;text-align:center;color:#666;font-size:12px;border-top:1px solid #e0e0e0}.text-primary{color:#d32f2f;font-weight:600}</style>" +
            "</head><body><div class='container'>" +
            "<div class='header'><h1>📍 Delivery Address Updated</h1></div>" +
            "<div class='content'>" +
            "<p style='font-size:16px;color:#333;margin:0 0 20px 0;'>Hello <span class='text-primary'>%s</span>,</p>" +
            "<div class='success-banner'><p>✅ Your delivery address has been updated successfully.</p></div>" +
            "<p style='font-size:15px;color:#555;line-height:1.6;'>Future orders will be delivered to:</p>" +
            "<div class='address-box'>" +
            "<p><strong>%s</strong></p>" +
            "<p>%s, %s, %s</p>" +
            "</div>" +
            "<p style='font-size:14px;color:#777;'>If you did not make this change, please contact our support team.</p>" +
            "</div>" +
            "<div class='footer'><p><strong>Local Hunt</strong></p><p>Your trusted marketplace for authentic Nepali products</p></div>" +
            "</div></body></html>",
            fullName != null ? fullName : "Customer",
            address != null ? address : "",
            area != null ? area : "",
            city != null ? city : "",
            region != null ? region : ""
        );
        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send profile update confirmation email to user (customer)
     */
    public void sendUserProfileUpdateEmail(String to, String fullName) {
        String subject = "Profile Updated - Local Hunt";
        String htmlContent = String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "<style>body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5}.container{max-width:600px;margin:0 auto;background:#fff}.header{background:linear-gradient(135deg,#d32f2f 0%%,#f44336 100%%);padding:40px 20px;text-align:center}.header h1{color:#fff;margin:0;font-size:28px;font-weight:600}.content{padding:40px 30px}.success-banner{background:linear-gradient(135deg,#e8f5e9 0%%,#c8e6c9 100%%);border-left:4px solid #4caf50;padding:20px;margin:25px 0;border-radius:8px}.success-banner p{margin:0;color:#2e7d32;font-weight:600;font-size:16px}.footer{background:#f9f9f9;padding:30px;text-align:center;color:#666;font-size:12px;border-top:1px solid #e0e0e0}.text-primary{color:#d32f2f;font-weight:600}</style>" +
            "</head><body><div class='container'>" +
            "<div class='header'><h1>✏️ Profile Updated</h1></div>" +
            "<div class='content'>" +
            "<p style='font-size:16px;color:#333;margin:0 0 20px 0;'>Hello <span class='text-primary'>%s</span>,</p>" +
            "<div class='success-banner'><p>✅ Your profile has been updated successfully.</p></div>" +
            "<p style='font-size:15px;color:#555;line-height:1.6;'>The changes to your account have been saved. If you did not make these changes, please contact our support team immediately.</p>" +
            "</div>" +
            "<div class='footer'><p><strong>Local Hunt</strong></p><p>Your trusted marketplace for authentic Nepali products</p><p style='margin-top:15px;font-size:11px;'>© 2024 Local Hunt. All rights reserved.</p></div>" +
            "</div></body></html>",
            fullName != null ? fullName : "User"
        );
        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send password change confirmation email to user (customer)
     */
    public void sendUserPasswordChangeEmail(String to, String fullName) {
        String subject = "Password Changed - Local Hunt";
        String htmlContent = String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "<style>body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5}.container{max-width:600px;margin:0 auto;background:#fff}.header{background:linear-gradient(135deg,#d32f2f 0%%,#f44336 100%%);padding:40px 20px;text-align:center}.header h1{color:#fff;margin:0;font-size:28px;font-weight:600}.content{padding:40px 30px}.success-banner{background:linear-gradient(135deg,#e8f5e9 0%%,#c8e6c9 100%%);border-left:4px solid #4caf50;padding:20px;margin:25px 0;border-radius:8px}.success-banner p{margin:0;color:#2e7d32;font-weight:600;font-size:16px}.info-box{background:#fff3e0;border-left:4px solid #ff9800;padding:15px 20px;margin:25px 0;border-radius:4px}.info-box p{margin:5px 0;color:#e65100;font-size:14px}.footer{background:#f9f9f9;padding:30px;text-align:center;color:#666;font-size:12px;border-top:1px solid #e0e0e0}.text-primary{color:#d32f2f;font-weight:600}</style>" +
            "</head><body><div class='container'>" +
            "<div class='header'><h1>🔐 Password Changed</h1></div>" +
            "<div class='content'>" +
            "<p style='font-size:16px;color:#333;margin:0 0 20px 0;'>Hello <span class='text-primary'>%s</span>,</p>" +
            "<div class='success-banner'><p>✅ Your password has been changed successfully.</p></div>" +
            "<div class='info-box'><p><strong>🔒 Security:</strong> If you did not make this change, please reset your password immediately or contact our support team.</p></div>" +
            "</div>" +
            "<div class='footer'><p><strong>Local Hunt</strong></p><p>Your trusted marketplace for authentic Nepali products</p><p style='margin-top:15px;font-size:11px;'>© 2024 Local Hunt. All rights reserved.</p></div>" +
            "</div></body></html>",
            fullName != null ? fullName : "User"
        );
        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send profile update confirmation email to vendor
     */
    public void sendVendorProfileUpdateEmail(String to, String userName, String businessName) {
        String subject = "Vendor Profile Updated - Local Hunt";
        String htmlContent = String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "<style>body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5}.container{max-width:600px;margin:0 auto;background:#fff}.header{background:linear-gradient(135deg,#d32f2f 0%%,#f44336 100%%);padding:40px 20px;text-align:center}.header h1{color:#fff;margin:0;font-size:28px;font-weight:600}.content{padding:40px 30px}.success-banner{background:linear-gradient(135deg,#e8f5e9 0%%,#c8e6c9 100%%);border-left:4px solid #4caf50;padding:20px;margin:25px 0;border-radius:8px}.success-banner p{margin:0;color:#2e7d32;font-weight:600;font-size:16px}.footer{background:#f9f9f9;padding:30px;text-align:center;color:#666;font-size:12px;border-top:1px solid #e0e0e0}.text-primary{color:#d32f2f;font-weight:600}</style>" +
            "</head><body><div class='container'>" +
            "<div class='header'><h1>✏️ Vendor Profile Updated</h1></div>" +
            "<div class='content'>" +
            "<p style='font-size:16px;color:#333;margin:0 0 20px 0;'>Hello <span class='text-primary'>%s</span>,</p>" +
            "<div class='success-banner'><p>✅ Your vendor profile for <strong>%s</strong> has been updated successfully.</p></div>" +
            "<p style='font-size:15px;color:#555;line-height:1.6;'>The changes to your account have been saved. If you did not make these changes, please contact our support team immediately.</p>" +
            "</div>" +
            "<div class='footer'><p><strong>Local Hunt</strong></p><p>Your trusted marketplace for authentic Nepali products</p><p style='margin-top:15px;font-size:11px;'>© 2024 Local Hunt. All rights reserved.</p></div>" +
            "</div></body></html>",
            userName != null ? userName : "Vendor",
            businessName != null ? businessName : "Your Business"
        );
        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send password change confirmation email to vendor
     */
    public void sendVendorPasswordChangeEmail(String to, String userName, String businessName) {
        String subject = "Vendor Password Changed - Local Hunt";
        String htmlContent = String.format(
            "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "<style>body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5}.container{max-width:600px;margin:0 auto;background:#fff}.header{background:linear-gradient(135deg,#d32f2f 0%%,#f44336 100%%);padding:40px 20px;text-align:center}.header h1{color:#fff;margin:0;font-size:28px;font-weight:600}.content{padding:40px 30px}.success-banner{background:linear-gradient(135deg,#e8f5e9 0%%,#c8e6c9 100%%);border-left:4px solid #4caf50;padding:20px;margin:25px 0;border-radius:8px}.success-banner p{margin:0;color:#2e7d32;font-weight:600;font-size:16px}.info-box{background:#fff3e0;border-left:4px solid #ff9800;padding:15px 20px;margin:25px 0;border-radius:4px}.info-box p{margin:5px 0;color:#e65100;font-size:14px}.footer{background:#f9f9f9;padding:30px;text-align:center;color:#666;font-size:12px;border-top:1px solid #e0e0e0}.text-primary{color:#d32f2f;font-weight:600}</style>" +
            "</head><body><div class='container'>" +
            "<div class='header'><h1>🔐 Vendor Password Changed</h1></div>" +
            "<div class='content'>" +
            "<p style='font-size:16px;color:#333;margin:0 0 20px 0;'>Hello <span class='text-primary'>%s</span>,</p>" +
            "<div class='success-banner'><p>✅ Your vendor account password for <strong>%s</strong> has been changed successfully.</p></div>" +
            "<div class='info-box'><p><strong>🔒 Security:</strong> If you did not make this change, please reset your password immediately or contact our support team.</p></div>" +
            "</div>" +
            "<div class='footer'><p><strong>Local Hunt</strong></p><p>Your trusted marketplace for authentic Nepali products</p><p style='margin-top:15px;font-size:11px;'>© 2024 Local Hunt. All rights reserved.</p></div>" +
            "</div></body></html>",
            userName != null ? userName : "Vendor",
            businessName != null ? businessName : "Your Business"
        );
        sendHtmlEmail(to, subject, htmlContent);
    }
}
