package com.localhunts.backend.service;

import com.localhunts.backend.dto.AddressRequest;
import com.localhunts.backend.dto.AuthResponse;
import com.localhunts.backend.dto.ChangePasswordRequest;
import com.localhunts.backend.dto.LoginRequest;
import com.localhunts.backend.dto.OtpRequest;
import com.localhunts.backend.dto.OtpVerifyRequest;
import com.localhunts.backend.dto.ResetPasswordRequest;
import com.localhunts.backend.dto.SignupRequest;
import com.localhunts.backend.dto.UpdateProfileRequest;
import com.localhunts.backend.dto.UserListResponse;
import com.localhunts.backend.dto.UserProfileResponse;
import com.localhunts.backend.model.Otp;
import com.localhunts.backend.model.Payment;
import com.localhunts.backend.model.Product;
import com.localhunts.backend.model.Role;
import com.localhunts.backend.model.User;
import com.localhunts.backend.repository.CartRepository;
import com.localhunts.backend.repository.DeliveredRepository;
import com.localhunts.backend.repository.OtpRepository;
import com.localhunts.backend.repository.PaymentRepository;
import com.localhunts.backend.repository.ProductRepository;
import com.localhunts.backend.repository.SellerRepository;
import com.localhunts.backend.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.Random;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private DeliveredRepository deliveredRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OtpRepository otpRepository;

    @Autowired
    private SellerRepository sellerRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private FileStorageService fileStorageService;

    public AuthResponse signup(SignupRequest signupRequest) {
        // Check if passwords match
        if (!signupRequest.getPassword().equals(signupRequest.getConfirmPassword())) {
            return new AuthResponse("Passwords do not match", false);
        }

        // Check if user already exists
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            return new AuthResponse("Email already exists", false);
        }

        // Create new user
        User user = new User();
        user.setFullName(signupRequest.getFullName());
        user.setEmail(signupRequest.getEmail());
        user.setPhone(signupRequest.getPhone());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setRole(Role.USER); // Default role is USER

        User savedUser = userRepository.save(user);

        // Send welcome email
        try {
            emailService.sendUserWelcomeEmail(savedUser.getEmail(), savedUser.getFullName());
        } catch (Exception e) {
            System.err.println("Failed to send welcome email: " + e.getMessage());
            // Don't fail signup if email fails
        }

        return new AuthResponse(
            "User registered successfully",
            savedUser.getId(),
            savedUser.getEmail(),
            savedUser.getFullName(),
            savedUser.getRole(),
            true
        );
    }

    public AuthResponse login(LoginRequest loginRequest) {
        // Find user by email
        User user = userRepository.findByEmail(loginRequest.getEmail())
            .orElse(null);

        if (user == null) {
            return new AuthResponse("Invalid email or password", false);
        }

        // Check password
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return new AuthResponse("Invalid email or password", false);
        }

        return new AuthResponse(
            "Login successful",
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getRole(),
            true
        );
    }

    /**
     * Generate and send OTP for login
     */
    public AuthResponse requestOTP(OtpRequest otpRequest) {
        // Check if user exists
        User user = userRepository.findByEmail(otpRequest.getEmail())
            .orElse(null);

        if (user == null) {
            // Don't reveal if user exists or not for security
            return new AuthResponse("If this email exists, an OTP has been sent", true);
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
            emailService.sendOTPEmail(otpRequest.getEmail(), otpCode, user.getFullName());
        } catch (Exception e) {
            System.err.println("Failed to send OTP email: " + e.getMessage());
            return new AuthResponse("Failed to send OTP. Please try again.", false);
        }

        return new AuthResponse("OTP sent to your email. Please check your inbox.", true);
    }

    /**
     * Verify OTP and login
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

        // Find user
        User user = userRepository.findByEmail(verifyRequest.getEmail())
            .orElse(null);

        if (user == null) {
            return new AuthResponse("User not found", false);
        }

        // Delete OTP after successful verification
        otpRepository.delete(otp);

        return new AuthResponse(
            "Login successful",
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getRole(),
            true
        );
    }

    public UserProfileResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return null;
        }
        UserProfileResponse response = new UserProfileResponse(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getPhone(),
            user.getRole()
        );
        response.setRegion(user.getRegion());
        response.setCity(user.getCity());
        response.setArea(user.getArea());
        response.setAddress(user.getAddress());
        response.setProfilePicture(user.getProfilePicture());
        return response;
    }

    public UserProfileResponse updateUserProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if email is being changed and if new email already exists (for a different user)
        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Update user fields
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());

        User updatedUser = userRepository.save(user);
        UserProfileResponse response = new UserProfileResponse(
            updatedUser.getId(),
            updatedUser.getFullName(),
            updatedUser.getEmail(),
            updatedUser.getPhone(),
            updatedUser.getRole()
        );
        response.setRegion(updatedUser.getRegion());
        response.setCity(updatedUser.getCity());
        response.setArea(updatedUser.getArea());
        response.setAddress(updatedUser.getAddress());
        response.setProfilePicture(updatedUser.getProfilePicture());

        try {
            emailService.sendUserProfileUpdateEmail(updatedUser.getEmail(), updatedUser.getFullName());
        } catch (Exception e) {
            System.err.println("Failed to send profile update email: " + e.getMessage());
        }
        return response;
    }

    @Transactional
    public UserProfileResponse updateUserLocation(Long userId, AddressRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRegion(request.getRegion());
        user.setCity(request.getCity());
        user.setArea(request.getArea());
        user.setAddress(request.getAddress());

        User updatedUser = userRepository.save(user);
        UserProfileResponse response = new UserProfileResponse(
            updatedUser.getId(),
            updatedUser.getFullName(),
            updatedUser.getEmail(),
            updatedUser.getPhone(),
            updatedUser.getRole()
        );
        response.setRegion(updatedUser.getRegion());
        response.setCity(updatedUser.getCity());
        response.setArea(updatedUser.getArea());
        response.setAddress(updatedUser.getAddress());
        response.setProfilePicture(updatedUser.getProfilePicture());

        try {
            emailService.sendDeliveryAddressUpdatedEmail(
                updatedUser.getEmail(),
                updatedUser.getFullName(),
                updatedUser.getAddress(),
                updatedUser.getArea(),
                updatedUser.getCity(),
                updatedUser.getRegion()
            );
        } catch (Exception e) {
            System.err.println("Failed to send delivery address updated email: " + e.getMessage());
        }
        return response;
    }

    public List<UserListResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(user -> new UserListResponse(
                    user.getId(),
                    user.getFullName(),
                    user.getEmail(),
                    user.getPhone(),
                    user.getRole()
                ))
                .collect(Collectors.toList());
    }

    public AuthResponse changePassword(Long userId, ChangePasswordRequest request) {
        // Find user
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify old password
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            return new AuthResponse("Old password is incorrect", false);
        }

        // Check if new password and confirm password match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return new AuthResponse("New password and confirm password do not match", false);
        }

        // Check if new password is different from old password
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            return new AuthResponse("New password must be different from old password", false);
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        try {
            emailService.sendUserPasswordChangeEmail(user.getEmail(), user.getFullName());
        } catch (Exception e) {
            System.err.println("Failed to send password change email: " + e.getMessage());
        }
        return new AuthResponse("Password changed successfully", true);
    }

    /**
     * Request password reset OTP. Only users (customers) registered in users table can use this.
     */
    public AuthResponse forgotPassword(OtpRequest request) {
        // Check if user exists — only users can use this flow
        User user = userRepository.findByEmail(request.getEmail())
            .orElse(null);

        if (user != null) {
            // Proceed: email is registered as customer (even if also a vendor)
        } else if (sellerRepository.existsByContactEmail(request.getEmail())) {
            return new AuthResponse("This email is registered as a vendor. Please use the Vendor Forgot Password page.", false);
        } else {
            return new AuthResponse("This email is not registered as a customer.", false);
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
            emailService.sendPasswordResetOTPEmail(request.getEmail(), otpCode, user.getFullName());
        } catch (Exception e) {
            System.err.println("Failed to send password reset OTP email: " + e.getMessage());
            return new AuthResponse("Failed to send OTP. Please try again.", false);
        }

        return new AuthResponse("Password reset OTP sent to your email. Please check your inbox.", true);
    }

    /**
     * Reset password using OTP
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

        // Find user — only users can use this flow
        User user = userRepository.findByEmail(request.getEmail())
            .orElse(null);

        if (user != null) {
            // Proceed with update
        } else if (sellerRepository.existsByContactEmail(request.getEmail())) {
            return new AuthResponse("This email is registered as a vendor. Please use the Vendor Forgot Password page.", false);
        } else {
            return new AuthResponse("This email is not registered as a customer.", false);
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Delete OTP after successful password reset
        otpRepository.delete(otp);

        try {
            emailService.sendUserPasswordChangeEmail(user.getEmail(), user.getFullName());
        } catch (Exception e) {
            System.err.println("Failed to send password reset confirmation email: " + e.getMessage());
        }
        return new AuthResponse("Password reset successfully", true);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Delete all cart items associated with this user
        cartRepository.deleteByUser(user);

        // For Payment orders (non-delivered orders), restore product stock before deleting
        List<Payment> payments = paymentRepository.findByUser(user);
        for (Payment payment : payments) {
            // Only restore stock if product exists (product might have been deleted)
            if (payment.getProduct() != null) {
                Product product = payment.getProduct();
                // Restore stock by adding back the quantity that was ordered
                int newStock = product.getStock() + payment.getQuantity();
                product.setStock(newStock);
                productRepository.save(product);
            }
        }
        // Delete all Payment orders (non-delivered orders) after restoring stock
        paymentRepository.deleteAll(payments);

        // For Delivered orders, set user_id to NULL to preserve order data
        // but allow user deletion (foreign key constraint)
        // No need to restore stock for delivered orders as they were already shipped
        List<com.localhunts.backend.model.Delivered> deliveredOrders = deliveredRepository.findByUser(user);
        for (com.localhunts.backend.model.Delivered delivered : deliveredOrders) {
            delivered.setUser(null);
            deliveredRepository.save(delivered);
        }

        // Delete the user
        userRepository.delete(user);
    }

    @Transactional
    public UserProfileResponse updateProfilePicture(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Delete old profile picture if exists
        if (user.getProfilePicture() != null && !user.getProfilePicture().isEmpty()) {
            fileStorageService.deleteFile(user.getProfilePicture());
        }

        // Store new profile picture
        String fileUrl = fileStorageService.storeProfilePicture(file);
        user.setProfilePicture(fileUrl);
        User updatedUser = userRepository.save(user);

        UserProfileResponse response = new UserProfileResponse(
            updatedUser.getId(),
            updatedUser.getFullName(),
            updatedUser.getEmail(),
            updatedUser.getPhone(),
            updatedUser.getRole()
        );
        response.setRegion(updatedUser.getRegion());
        response.setCity(updatedUser.getCity());
        response.setArea(updatedUser.getArea());
        response.setAddress(updatedUser.getAddress());
        response.setProfilePicture(updatedUser.getProfilePicture());

        return response;
    }
}
