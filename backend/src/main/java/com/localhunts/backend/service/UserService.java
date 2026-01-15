package com.localhunts.backend.service;

import com.localhunts.backend.dto.AuthResponse;
import com.localhunts.backend.dto.LoginRequest;
import com.localhunts.backend.dto.SignupRequest;
import com.localhunts.backend.dto.UpdateProfileRequest;
import com.localhunts.backend.dto.UserListResponse;
import com.localhunts.backend.dto.UserProfileResponse;
import com.localhunts.backend.model.Role;
import com.localhunts.backend.model.User;
import com.localhunts.backend.repository.CartRepository;
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
        return new UserProfileResponse(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getPhone(),
            user.getRole()
        );
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
        return new UserProfileResponse(
            updatedUser.getId(),
            updatedUser.getFullName(),
            updatedUser.getEmail(),
            updatedUser.getPhone(),
            updatedUser.getRole()
        );
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

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Delete all cart items associated with this user
        cartRepository.deleteByUser(user);

        // Delete the user
        userRepository.delete(user);
    }
}
