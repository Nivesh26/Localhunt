package com.localhunts.backend.service;

import com.localhunts.backend.dto.AuthResponse;
import com.localhunts.backend.dto.ChangePasswordRequest;
import com.localhunts.backend.dto.OtpRequest;
import com.localhunts.backend.dto.OtpVerifyRequest;
import com.localhunts.backend.dto.SellerListResponse;
import com.localhunts.backend.dto.SellerLoginRequest;
import com.localhunts.backend.dto.SellerProfileResponse;
import com.localhunts.backend.dto.SellerSignupRequest;
import com.localhunts.backend.dto.UpdateSellerSettingsRequest;
import com.localhunts.backend.model.Otp;
import com.localhunts.backend.model.Product;
import com.localhunts.backend.model.Role;
import com.localhunts.backend.model.Seller;
import com.localhunts.backend.repository.CartRepository;
import com.localhunts.backend.repository.DeliveredRepository;
import com.localhunts.backend.repository.OtpRepository;
import com.localhunts.backend.repository.PaymentRepository;
import com.localhunts.backend.repository.ProductRepository;
import com.localhunts.backend.repository.SellerRepository;
import java.time.LocalDateTime;
import java.util.Random;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SellerService {

    @Autowired
    private SellerRepository sellerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private DeliveredRepository deliveredRepository;

    @Autowired
    private OtpRepository otpRepository;

    @Autowired
    private EmailService emailService;

    public AuthResponse signup(SellerSignupRequest signupRequest) {
        // Check if passwords match
        if (!signupRequest.getPassword().equals(signupRequest.getConfirmPassword())) {
            return new AuthResponse("Passwords do not match", false);
        }

        // Check if seller already exists
        if (sellerRepository.existsByContactEmail(signupRequest.getContactEmail())) {
            return new AuthResponse("Email already exists", false);
        }

        // Create new seller
        Seller seller = new Seller();
        seller.setUserName(signupRequest.getUserName());
        seller.setPhoneNumber(signupRequest.getPhoneNumber());
        seller.setContactEmail(signupRequest.getContactEmail());
        seller.setLocation(signupRequest.getLocation());
        seller.setBusinessName(signupRequest.getBusinessName());
        seller.setBusinessCategory(signupRequest.getBusinessCategory());
        seller.setBusinessPanVat(signupRequest.getBusinessPanVat());
        seller.setBusinessLocation(signupRequest.getBusinessLocation());
        seller.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        seller.setRole(Role.VENDOR);
        seller.setApproved(false); // Needs admin approval
        seller.setBusinessRegistrationCertificate(signupRequest.getBusinessRegistrationCertificate());
        seller.setPanVatCertificate(signupRequest.getPanVatCertificate());

        Seller savedSeller = sellerRepository.save(seller);

        // Send welcome email
        try {
            emailService.sendVendorWelcomeEmail(
                savedSeller.getContactEmail(), 
                savedSeller.getUserName(), 
                savedSeller.getBusinessName()
            );
        } catch (Exception e) {
            System.err.println("Failed to send welcome email: " + e.getMessage());
            // Don't fail signup if email fails
        }

        return new AuthResponse(
            "Seller registration submitted successfully. Waiting for admin approval.",
            savedSeller.getId(),
            savedSeller.getContactEmail(),
            savedSeller.getUserName(),
            savedSeller.getRole(),
            true
        );
    }

    public AuthResponse login(SellerLoginRequest loginRequest) {
        // Find seller by email
        Seller seller = sellerRepository.findByContactEmail(loginRequest.getEmail())
            .orElse(null);

        if (seller == null) {
            return new AuthResponse("Invalid email or password", false);
        }

        // Check password
        if (!passwordEncoder.matches(loginRequest.getPassword(), seller.getPassword())) {
            return new AuthResponse("Invalid email or password", false);
        }

        // Check if seller is approved
        if (!seller.getApproved()) {
            return new AuthResponse("Your account is pending approval. Please wait for admin approval.", false);
        }

        return new AuthResponse(
            "Login successful",
            seller.getId(),
            seller.getContactEmail(),
            seller.getUserName(),
            seller.getRole(),
            true
        );
    }

    /**
     * Generate and send OTP for seller/vendor login
     */
    public AuthResponse requestOTP(OtpRequest otpRequest) {
        // Check if seller exists
        Seller seller = sellerRepository.findByContactEmail(otpRequest.getEmail())
            .orElse(null);

        if (seller == null) {
            // Don't reveal if seller exists or not for security
            return new AuthResponse("If this email exists, an OTP has been sent", true);
        }

        // Check if seller is approved
        if (!seller.getApproved()) {
            return new AuthResponse("Your account is pending approval. Please wait for admin approval.", false);
        }

        // Generate 6-digit OTP
        String otpCode = String.format("%06d", new Random().nextInt(1000000));

        // Mark all previous OTPs for this email as used
        otpRepository.markAllAsUsedByEmail(otpRequest.getEmail());

        // Create new OTP
        Otp otp = new Otp();
        otp.setEmail(otpRequest.getEmail());
        otp.setOtpCode(otpCode);
        otpRepository.save(otp);

        // Send OTP via email
        try {
            emailService.sendOTPEmail(otpRequest.getEmail(), otpCode, seller.getUserName());
        } catch (Exception e) {
            System.err.println("Failed to send OTP email: " + e.getMessage());
            return new AuthResponse("Failed to send OTP. Please try again.", false);
        }

        return new AuthResponse("OTP sent to your email. Please check your inbox.", true);
    }

    /**
     * Verify OTP and login for seller/vendor
     */
    public AuthResponse verifyOTP(OtpVerifyRequest verifyRequest) {
        // Find valid OTP
        Otp otp = otpRepository.findByEmailAndOtpCodeAndUsedFalse(
            verifyRequest.getEmail(), 
            verifyRequest.getOtp()
        ).orElse(null);

        if (otp == null) {
            return new AuthResponse("Invalid or expired OTP", false);
        }

        // Check if OTP is expired
        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            return new AuthResponse("OTP has expired. Please request a new one.", false);
        }

        // Find seller
        Seller seller = sellerRepository.findByContactEmail(verifyRequest.getEmail())
            .orElse(null);

        if (seller == null) {
            return new AuthResponse("Seller not found", false);
        }

        // Check if seller is approved
        if (!seller.getApproved()) {
            return new AuthResponse("Your account is pending approval. Please wait for admin approval.", false);
        }

        // Delete OTP after successful verification
        otpRepository.delete(otp);

        return new AuthResponse(
            "Login successful",
            seller.getId(),
            seller.getContactEmail(),
            seller.getUserName(),
            seller.getRole(),
            true
        );
    }

    public List<SellerListResponse> getPendingSellers() {
        List<Seller> sellers = sellerRepository.findByApprovedFalse();
        return sellers.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    public List<SellerListResponse> getApprovedSellers() {
        List<Seller> sellers = sellerRepository.findByApprovedTrue();
        return sellers.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    public SellerListResponse approveSeller(Long sellerId) {
        Seller seller = sellerRepository.findById(sellerId)
            .orElseThrow(() -> new RuntimeException("Seller not found"));
        
        seller.setApproved(true);
        Seller updatedSeller = sellerRepository.save(seller);
        
        // Send approval notification email
        try {
            System.out.println("Sending approval email to: " + updatedSeller.getContactEmail());
            emailService.sendVendorApprovalEmail(
                updatedSeller.getContactEmail(), 
                updatedSeller.getUserName(), 
                updatedSeller.getBusinessName()
            );
            System.out.println("Approval email sent successfully to: " + updatedSeller.getContactEmail());
        } catch (Exception e) {
            System.err.println("Failed to send approval email to " + updatedSeller.getContactEmail() + ": " + e.getMessage());
            e.printStackTrace();
            // Don't fail approval if email fails
        }
        
        return convertToResponse(updatedSeller);
    }

    public void rejectSeller(Long sellerId) {
        Seller seller = sellerRepository.findById(sellerId)
            .orElseThrow(() -> new RuntimeException("Seller not found"));
        
        sellerRepository.delete(seller);
    }

    public SellerProfileResponse getSellerProfile(Long sellerId) {
        Seller seller = sellerRepository.findById(sellerId)
            .orElseThrow(() -> new RuntimeException("Seller not found"));
        
        SellerProfileResponse response = new SellerProfileResponse(
            seller.getId(),
            seller.getUserName(),
            seller.getPhoneNumber(),
            seller.getContactEmail(),
            seller.getLocation(),
            seller.getBusinessName(),
            seller.getBusinessCategory(),
            seller.getBusinessPanVat(),
            seller.getBusinessLocation(),
            seller.getStoreDescription() != null ? seller.getStoreDescription() : "",
            seller.getRole()
        );
        response.setStoreStatus(seller.getStoreStatus());
        return response;
    }

    public SellerProfileResponse updateSellerSettings(Long sellerId, UpdateSellerSettingsRequest request) {
        Seller seller = sellerRepository.findById(sellerId)
            .orElseThrow(() -> new RuntimeException("Seller not found"));

        // Check if email is being changed and if new email already exists (for a different seller)
        if (!seller.getContactEmail().equals(request.getContactEmail()) && 
            sellerRepository.existsByContactEmail(request.getContactEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Update seller fields
        seller.setUserName(request.getUserName());
        seller.setPhoneNumber(request.getPhoneNumber());
        seller.setContactEmail(request.getContactEmail());
        seller.setLocation(request.getLocation());
        seller.setBusinessName(request.getBusinessName());
        seller.setBusinessCategory(request.getBusinessCategory());
        seller.setBusinessPanVat(request.getBusinessPanVat());
        seller.setBusinessLocation(request.getBusinessLocation());
        seller.setStoreDescription(request.getStoreDescription() != null ? request.getStoreDescription() : "");

        Seller updatedSeller = sellerRepository.save(seller);
        
        SellerProfileResponse response = new SellerProfileResponse(
            updatedSeller.getId(),
            updatedSeller.getUserName(),
            updatedSeller.getPhoneNumber(),
            updatedSeller.getContactEmail(),
            updatedSeller.getLocation(),
            updatedSeller.getBusinessName(),
            updatedSeller.getBusinessCategory(),
            updatedSeller.getBusinessPanVat(),
            updatedSeller.getBusinessLocation(),
            updatedSeller.getStoreDescription() != null ? updatedSeller.getStoreDescription() : "",
            updatedSeller.getRole()
        );
        response.setStoreStatus(updatedSeller.getStoreStatus());
        return response;
    }

    @Transactional
    public SellerProfileResponse toggleStoreStatus(Long sellerId) {
        Seller seller = sellerRepository.findById(sellerId)
            .orElseThrow(() -> new RuntimeException("Seller not found"));
        
        // Toggle store status
        seller.setStoreStatus(!seller.getStoreStatus());
        Seller updatedSeller = sellerRepository.save(seller);
        
        SellerProfileResponse response = new SellerProfileResponse(
            updatedSeller.getId(),
            updatedSeller.getUserName(),
            updatedSeller.getPhoneNumber(),
            updatedSeller.getContactEmail(),
            updatedSeller.getLocation(),
            updatedSeller.getBusinessName(),
            updatedSeller.getBusinessCategory(),
            updatedSeller.getBusinessPanVat(),
            updatedSeller.getBusinessLocation(),
            updatedSeller.getStoreDescription() != null ? updatedSeller.getStoreDescription() : "",
            updatedSeller.getRole()
        );
        response.setStoreStatus(updatedSeller.getStoreStatus());
        return response;
    }

    public AuthResponse changePassword(Long sellerId, ChangePasswordRequest request) {
        // Find seller
        Seller seller = sellerRepository.findById(sellerId)
            .orElseThrow(() -> new RuntimeException("Seller not found"));

        // Verify old password
        if (!passwordEncoder.matches(request.getOldPassword(), seller.getPassword())) {
            return new AuthResponse("Old password is incorrect", false);
        }

        // Check if new password and confirm password match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return new AuthResponse("New password and confirm password do not match", false);
        }

        // Check if new password is different from old password
        if (passwordEncoder.matches(request.getNewPassword(), seller.getPassword())) {
            return new AuthResponse("New password must be different from old password", false);
        }

        // Update password
        seller.setPassword(passwordEncoder.encode(request.getNewPassword()));
        sellerRepository.save(seller);

        return new AuthResponse("Password changed successfully", true);
    }

    @Transactional
    public void deleteSeller(Long sellerId) {
        Seller seller = sellerRepository.findById(sellerId)
            .orElseThrow(() -> new RuntimeException("Seller not found"));
        
        // Find all products by this seller
        List<Product> products = productRepository.findBySeller(seller);
        
        // Delete all cart items that reference these products
        for (Product product : products) {
            cartRepository.deleteByProduct(product);
        }
        
        // Delete all Payment orders (non-delivered orders) for products of this seller
        List<com.localhunts.backend.model.Payment> payments = paymentRepository.findBySeller(seller);
        paymentRepository.deleteAll(payments);
        
        // For Delivered orders, set product_id to NULL to preserve order data
        // but allow product deletion (foreign key constraint)
        List<com.localhunts.backend.model.Delivered> deliveredOrders = deliveredRepository.findBySeller(seller);
        for (com.localhunts.backend.model.Delivered delivered : deliveredOrders) {
            delivered.setProduct(null);
            deliveredRepository.save(delivered);
        }
        
        // Delete all products
        productRepository.deleteAll(products);
        
        // Delete the seller
        sellerRepository.delete(seller);
    }

    private SellerListResponse convertToResponse(Seller seller) {
        SellerListResponse response = new SellerListResponse();
        response.setId(seller.getId());
        response.setUserName(seller.getUserName());
        response.setPhoneNumber(seller.getPhoneNumber());
        response.setContactEmail(seller.getContactEmail());
        response.setLocation(seller.getLocation());
        response.setBusinessName(seller.getBusinessName());
        response.setBusinessCategory(seller.getBusinessCategory());
        response.setBusinessPanVat(seller.getBusinessPanVat());
        response.setBusinessLocation(seller.getBusinessLocation());
        response.setApproved(seller.getApproved());
        response.setStoreStatus(seller.getStoreStatus());
        response.setRole(seller.getRole());
        response.setBusinessRegistrationCertificate(seller.getBusinessRegistrationCertificate());
        response.setPanVatCertificate(seller.getPanVatCertificate());
        
        if (seller.getCreatedAt() != null) {
            response.setCreatedAt(seller.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }
        
        return response;
    }
}
