package com.localhunts.backend.controller;

import com.localhunts.backend.dto.AdminDashboardStats;
import com.localhunts.backend.dto.AdminProfitDetailResponse;
import com.localhunts.backend.dto.OnboardingRequestResponse;
import com.localhunts.backend.dto.TopVendorResponse;
import com.localhunts.backend.dto.UserListResponse;
import com.localhunts.backend.service.AdminService;
import com.localhunts.backend.service.ProductService;
import com.localhunts.backend.service.SellerService;
import com.localhunts.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private SellerService sellerService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private ProductService productService;

    @GetMapping("/users")
    public ResponseEntity<List<UserListResponse>> getAllUsers() {
        try {
            List<UserListResponse> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Super admin: Permanently delete a user and all related data from the database
     * (reviews, review likes, chat, cart, payments, delivered orders, profile picture).
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            userService.deleteUser(userId);
            return ResponseEntity.ok().body("User deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting user");
        }
    }

    /**
     * Super admin: Permanently delete a vendor and all related data from the database
     * (reviews on their products, review likes, chat, cart, payments, delivered orders, products, profile picture).
     */
    @DeleteMapping("/vendors/{sellerId}")
    public ResponseEntity<Map<String, Object>> deleteVendor(@PathVariable Long sellerId) {
        try {
            sellerService.deleteSeller(sellerId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Vendor and all related data deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error deleting vendor");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Super admin: Permanently delete a product and all related data from the database.
     */
    @DeleteMapping("/products/{productId}")
    public ResponseEntity<Map<String, Object>> deleteProduct(@PathVariable Long productId) {
        try {
            productService.permanentDeleteProduct(productId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Product and all related data deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error deleting product");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<AdminDashboardStats> getDashboardStats() {
        try {
            AdminDashboardStats stats = adminService.getDashboardStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/dashboard/top-vendors")
    public ResponseEntity<List<TopVendorResponse>> getTopVendors() {
        try {
            List<TopVendorResponse> topVendors = adminService.getTopVendors();
            return ResponseEntity.ok(topVendors);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/dashboard/onboarding-requests")
    public ResponseEntity<List<OnboardingRequestResponse>> getOnboardingRequests() {
        try {
            List<OnboardingRequestResponse> requests = adminService.getOnboardingRequests();
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Super admin: Detailed profit breakdown - every delivered product's income and 20% commission.
     */
    @GetMapping("/profit-details")
    public ResponseEntity<List<AdminProfitDetailResponse>> getProfitDetails() {
        try {
            List<AdminProfitDetailResponse> details = adminService.getAdminProfitDetails();
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
