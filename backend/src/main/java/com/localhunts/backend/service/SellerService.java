package com.localhunts.backend.service;

import com.localhunts.backend.dto.AuthResponse;
import com.localhunts.backend.dto.ChangePasswordRequest;
import com.localhunts.backend.dto.OtpRequest;
import com.localhunts.backend.dto.OtpVerifyRequest;
import com.localhunts.backend.dto.ResetPasswordRequest;
import com.localhunts.backend.dto.SellerListResponse;
import com.localhunts.backend.dto.SellerLoginRequest;
import com.localhunts.backend.dto.SellerProfileResponse;
import com.localhunts.backend.dto.SellerSignupRequest;
import com.localhunts.backend.dto.UpdateSellerSettingsRequest;
import com.localhunts.backend.model.Otp;
import com.localhunts.backend.model.Product;
import com.localhunts.backend.model.Review;
import com.localhunts.backend.model.Role;
import com.localhunts.backend.model.Seller;
import com.localhunts.backend.repository.CartRepository;
import com.localhunts.backend.repository.ChatRepository;
import com.localhunts.backend.repository.DeliveredRepository;
import com.localhunts.backend.repository.OtpRepository;
import com.localhunts.backend.repository.PaymentRepository;
import com.localhunts.backend.repository.ProductRepository;
import com.localhunts.backend.repository.ReviewLikeRepository;
import com.localhunts.backend.repository.ReviewRepository;
import com.localhunts.backend.repository.SellerRepository;
import com.localhunts.backend.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.Random;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

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
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ReviewLikeRepository reviewLikeRepository;

    @Autowired
    private ChatRepository chatRepository;

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

        // Send rejection email before deleting so we have contact details
        try {
            emailService.sendVendorRejectionEmail(
                seller.getContactEmail(),
                seller.getUserName(),
                seller.getBusinessName()
            );
        } catch (Exception e) {
            System.err.println("Failed to send vendor rejection email: " + e.getMessage());
        }

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
        response.setProfilePicture(seller.getProfilePicture());
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

        try {
            emailService.sendVendorProfileUpdateEmail(
                updatedSeller.getContactEmail(),
                updatedSeller.getUserName(),
                updatedSeller.getBusinessName()
            );
        } catch (Exception e) {
            System.err.println("Failed to send vendor profile update email: " + e.getMessage());
        }
        return response;
    }

    @Transactional
    public SellerProfileResponse toggleStoreStatus(Long sellerId) {
        Seller seller = sellerRepository.findById(sellerId)
            .orElseThrow(() -> new RuntimeException("Seller not found"));
        
        // Toggle store status
        seller.setStoreStatus(!seller.getStoreStatus());
        Seller updatedSeller = sellerRepository.save(seller);
        
        // Send email notification based on store status
        try {
            if (updatedSeller.getStoreStatus()) {
                // Store is now active/resumed
                System.out.println("Sending store resumed email to: " + updatedSeller.getContactEmail());
                emailService.sendStoreResumedEmail(
                    updatedSeller.getContactEmail(),
                    updatedSeller.getUserName(),
                    updatedSeller.getBusinessName()
                );
                System.out.println("Store resumed email sent successfully to: " + updatedSeller.getContactEmail());
            } else {
                // Store is now paused
                System.out.println("Sending store paused email to: " + updatedSeller.getContactEmail());
                emailService.sendStorePausedEmail(
                    updatedSeller.getContactEmail(),
                    updatedSeller.getUserName(),
                    updatedSeller.getBusinessName()
                );
                System.out.println("Store paused email sent successfully to: " + updatedSeller.getContactEmail());
            }
        } catch (Exception e) {
            System.err.println("Failed to send store status email to " + updatedSeller.getContactEmail() + ": " + e.getMessage());
            e.printStackTrace();
            // Don't fail status toggle if email fails
        }
        
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

        try {
            emailService.sendVendorPasswordChangeEmail(
                seller.getContactEmail(),
                seller.getUserName(),
                seller.getBusinessName()
            );
        } catch (Exception e) {
            System.err.println("Failed to send vendor password change email: " + e.getMessage());
        }
        return new AuthResponse("Password changed successfully", true);
    }

    /**
     * Request password reset OTP for vendor. Only sellers (vendors) registered in sellers table can use this.
     */
    public AuthResponse forgotPassword(OtpRequest request) {
        // Check if seller exists — only sellers can use this flow
        Seller seller = sellerRepository.findByContactEmail(request.getEmail())
            .orElse(null);

        if (seller != null) {
            // Proceed: email is registered as vendor (even if also a customer)
        } else if (userRepository.existsByEmail(request.getEmail())) {
            return new AuthResponse("This email is registered as a customer. Please use the Customer Forgot Password page.", false);
        } else {
            return new AuthResponse("This email is not registered as a vendor.", false);
        }

        // Generate 6-digit OTP
        String otpCode = String.format("%06d", new Random().nextInt(1000000));

        // Mark all previous OTPs for this email as used
        otpRepository.markAllAsUsedByEmail(request.getEmail());

        // Create new OTP
        Otp otp = new Otp();
        otp.setEmail(request.getEmail());
        otp.setOtpCode(otpCode);
        otpRepository.save(otp);

        // Send password reset OTP via email
        try {
            emailService.sendPasswordResetOTPEmail(request.getEmail(), otpCode, seller.getUserName());
        } catch (Exception e) {
            System.err.println("Failed to send password reset OTP email: " + e.getMessage());
            return new AuthResponse("Failed to send OTP. Please try again.", false);
        }

        return new AuthResponse("Password reset OTP sent to your email. Please check your inbox.", true);
    }

    /**
     * Reset password using OTP for vendor
     */
    @Transactional
    public AuthResponse resetPassword(ResetPasswordRequest request) {
        // Find valid OTP
        Otp otp = otpRepository.findByEmailAndOtpCodeAndUsedFalse(
            request.getEmail(), 
            request.getOtp()
        ).orElse(null);

        if (otp == null) {
            return new AuthResponse("Invalid or expired OTP", false);
        }

        // Check if OTP is expired
        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            return new AuthResponse("OTP has expired. Please request a new one.", false);
        }

        // Check if new password and confirm password match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return new AuthResponse("New password and confirm password do not match", false);
        }

        // Find seller — only sellers can use this flow
        Seller seller = sellerRepository.findByContactEmail(request.getEmail())
            .orElse(null);

        if (seller != null) {
            // Proceed with update
        } else if (userRepository.existsByEmail(request.getEmail())) {
            return new AuthResponse("This email is registered as a customer. Please use the Customer Forgot Password page.", false);
        } else {
            return new AuthResponse("This email is not registered as a vendor.", false);
        }

        // Update password
        seller.setPassword(passwordEncoder.encode(request.getNewPassword()));
        sellerRepository.save(seller);

        // Delete OTP after successful password reset
        otpRepository.delete(otp);

        try {
            emailService.sendVendorPasswordChangeEmail(
                seller.getContactEmail(),
                seller.getUserName(),
                seller.getBusinessName()
            );
        } catch (Exception e) {
            System.err.println("Failed to send password reset confirmation email: " + e.getMessage());
        }
        return new AuthResponse("Password reset successfully", true);
    }

    @Transactional
    public void deleteSeller(Long sellerId) {
        Seller seller = sellerRepository.findById(sellerId)
            .orElseThrow(() -> new RuntimeException("Seller not found"));

        // 1. Delete review likes made by this vendor
        reviewLikeRepository.deleteAll(reviewLikeRepository.findByVendor(seller));

        // 2. Find all products by this seller; for each product delete reviews (and likes on them)
        List<Product> products = productRepository.findBySeller(seller);
        for (Product product : products) {
            List<Review> productReviews = reviewRepository.findByProduct(product);
            for (Review review : productReviews) {
                reviewLikeRepository.deleteAll(reviewLikeRepository.findByReview(review));
            }
            reviewRepository.deleteAll(productReviews);
        }

        // 3. Delete all chat messages involving this seller
        chatRepository.deleteAll(chatRepository.findBySeller(seller));

        // 4. Delete all cart items that reference these products
        for (Product product : products) {
            cartRepository.deleteByProduct(product);
        }

        // 5. Restore product stock for pending payments then delete payments
        List<com.localhunts.backend.model.Payment> payments = paymentRepository.findBySeller(seller);
        for (com.localhunts.backend.model.Payment payment : payments) {
            if (payment.getProduct() != null) {
                Product product = payment.getProduct();
                int newStock = product.getStock() + payment.getQuantity();
                product.setStock(newStock);
                productRepository.save(product);
            }
        }
        paymentRepository.deleteAll(payments);

        // 6. Delete all delivered order history for this seller's products
        deliveredRepository.deleteAll(deliveredRepository.findBySeller(seller));

        // 7. Delete all products
        productRepository.deleteAll(products);

        // 8. Delete seller profile picture if exists
        if (seller.getProfilePicture() != null && !seller.getProfilePicture().isEmpty()) {
            try {
                fileStorageService.deleteFile(seller.getProfilePicture());
            } catch (Exception e) {
                System.err.println("Failed to delete seller profile picture: " + e.getMessage());
            }
        }

        // 9. Delete the seller
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

    @Transactional
    public SellerProfileResponse updateProfilePicture(Long sellerId, MultipartFile file) {
        Seller seller = sellerRepository.findById(sellerId)
            .orElseThrow(() -> new RuntimeException("Seller not found"));

        // Delete old profile picture if exists
        if (seller.getProfilePicture() != null && !seller.getProfilePicture().isEmpty()) {
            fileStorageService.deleteFile(seller.getProfilePicture());
        }

        // Store new profile picture
        String fileUrl = fileStorageService.storeProfilePicture(file);
        seller.setProfilePicture(fileUrl);
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
        response.setProfilePicture(updatedSeller.getProfilePicture());

        try {
            emailService.sendVendorProfileUpdateEmail(
                updatedSeller.getContactEmail(),
                updatedSeller.getUserName(),
                updatedSeller.getBusinessName()
            );
        } catch (Exception e) {
            System.err.println("Failed to send vendor profile update email: " + e.getMessage());
        }
        return response;
    }
}
