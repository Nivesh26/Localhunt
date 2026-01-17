package com.localhunts.backend.controller;

import com.localhunts.backend.dto.AddressRequest;
import com.localhunts.backend.dto.AuthResponse;
import com.localhunts.backend.dto.ChangePasswordRequest;
import com.localhunts.backend.dto.LoginRequest;
import com.localhunts.backend.dto.OtpRequest;
import com.localhunts.backend.dto.OtpVerifyRequest;
import com.localhunts.backend.dto.ResetPasswordRequest;
import com.localhunts.backend.dto.SignupRequest;
import com.localhunts.backend.dto.UpdateProfileRequest;
import com.localhunts.backend.dto.UserProfileResponse;
import com.localhunts.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest signupRequest) {
        AuthResponse response = userService.signup(signupRequest);
        
        if (response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = userService.login(loginRequest);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable Long userId) {
        UserProfileResponse profile = userService.getUserProfile(userId);
        
        if (profile == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile/{userId}")
    public ResponseEntity<?> updateUserProfile(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateProfileRequest request) {
        try {
            UserProfileResponse profile = userService.updateUserProfile(userId, request);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/change-password/{userId}")
    public ResponseEntity<AuthResponse> changePassword(
            @PathVariable Long userId,
            @Valid @RequestBody ChangePasswordRequest request) {
        try {
            AuthResponse response = userService.changePassword(userId, request);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new AuthResponse("User not found", false));
        }
    }

    @PutMapping("/location/{userId}")
    public ResponseEntity<?> updateUserLocation(
            @PathVariable Long userId,
            @Valid @RequestBody AddressRequest request) {
        try {
            UserProfileResponse profile = userService.updateUserLocation(userId, request);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/request-otp")
    public ResponseEntity<AuthResponse> requestOTP(@Valid @RequestBody OtpRequest otpRequest) {
        AuthResponse response = userService.requestOTP(otpRequest);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOTP(@Valid @RequestBody OtpVerifyRequest verifyRequest) {
        AuthResponse response = userService.verifyOTP(verifyRequest);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<AuthResponse> forgotPassword(@Valid @RequestBody OtpRequest request) {
        AuthResponse response = userService.forgotPassword(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<AuthResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        AuthResponse response = userService.resetPassword(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}
