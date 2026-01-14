package com.localhunts.backend.controller;

import com.localhunts.backend.dto.AuthResponse;
import com.localhunts.backend.dto.SellerListResponse;
import com.localhunts.backend.dto.SellerLoginRequest;
import com.localhunts.backend.dto.SellerSignupRequest;
import com.localhunts.backend.service.SellerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seller")
public class SellerController {

    @Autowired
    private SellerService sellerService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SellerSignupRequest signupRequest) {
        AuthResponse response = sellerService.signup(signupRequest);
        
        if (response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody SellerLoginRequest loginRequest) {
        AuthResponse response = sellerService.login(loginRequest);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<List<SellerListResponse>> getPendingSellers() {
        List<SellerListResponse> sellers = sellerService.getPendingSellers();
        return ResponseEntity.ok(sellers);
    }

    @GetMapping("/approved")
    public ResponseEntity<List<SellerListResponse>> getApprovedSellers() {
        List<SellerListResponse> sellers = sellerService.getApprovedSellers();
        return ResponseEntity.ok(sellers);
    }

    @PostMapping("/{sellerId}/approve")
    public ResponseEntity<Map<String, Object>> approveSeller(@PathVariable Long sellerId) {
        try {
            SellerListResponse seller = sellerService.approveSeller(sellerId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Seller approved successfully");
            response.put("seller", seller);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @DeleteMapping("/{sellerId}/reject")
    public ResponseEntity<Map<String, Object>> rejectSeller(@PathVariable Long sellerId) {
        try {
            sellerService.rejectSeller(sellerId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Seller rejected successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @DeleteMapping("/{sellerId}")
    public ResponseEntity<Map<String, Object>> deleteSeller(@PathVariable Long sellerId) {
        try {
            sellerService.deleteSeller(sellerId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Vendor and all their products deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}
