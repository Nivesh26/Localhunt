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
}
