package com.localhunts.backend.service;

import com.localhunts.backend.dto.AddressRequest;
import com.localhunts.backend.dto.AuthResponse;
import com.localhunts.backend.dto.ChangePasswordRequest;
import com.localhunts.backend.dto.LoginRequest;
import com.localhunts.backend.dto.SignupRequest;
import com.localhunts.backend.dto.UpdateProfileRequest;
import com.localhunts.backend.dto.UserListResponse;
import com.localhunts.backend.dto.UserProfileResponse;
import com.localhunts.backend.model.Payment;
import com.localhunts.backend.model.Product;
import com.localhunts.backend.model.Role;
import com.localhunts.backend.model.User;
import com.localhunts.backend.repository.CartRepository;
import com.localhunts.backend.repository.DeliveredRepository;
import com.localhunts.backend.repository.PaymentRepository;
import com.localhunts.backend.repository.ProductRepository;
import com.localhunts.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        return new AuthResponse("Password changed successfully", true);
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
}
