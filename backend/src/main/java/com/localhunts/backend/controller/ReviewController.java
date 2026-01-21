package com.localhunts.backend.controller;

import com.localhunts.backend.dto.ReviewRequest;
import com.localhunts.backend.dto.ReviewResponse;
import com.localhunts.backend.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> createReview(
            @PathVariable Long userId,
            @Valid @RequestBody ReviewRequest request) {
        try {
            ReviewResponse review = reviewService.createReview(userId, request);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Review submitted successfully");
            response.put("review", review);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByProduct(
            @PathVariable Long productId,
            @RequestParam(required = false) Long userId) {
        try {
            List<ReviewResponse> reviews = reviewService.getReviewsByProduct(productId, userId);
            return ResponseEntity.ok(reviews);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/product/{productId}/has-reviewed/{userId}")
    public ResponseEntity<Map<String, Object>> hasUserReviewed(
            @PathVariable Long productId,
            @PathVariable Long userId) {
        try {
            boolean hasReviewed = reviewService.hasUserReviewed(userId, productId);
            Map<String, Object> response = new HashMap<>();
            response.put("hasReviewed", hasReviewed);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("hasReviewed", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @GetMapping("/product/{productId}/average-rating")
    public ResponseEntity<Map<String, Object>> getAverageRating(@PathVariable Long productId) {
        try {
            Double averageRating = reviewService.getAverageRating(productId);
            Map<String, Object> response = new HashMap<>();
            response.put("averageRating", averageRating);
            response.put("hasReviews", averageRating != null);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("averageRating", null);
            response.put("hasReviews", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @DeleteMapping("/{reviewId}/user/{userId}")
    public ResponseEntity<Map<String, Object>> deleteReview(
            @PathVariable Long reviewId,
            @PathVariable Long userId) {
        try {
            reviewService.deleteReview(reviewId, userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Review deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<ReviewResponse>> getAllReviews(
            @RequestParam(required = false) Long userId) {
        try {
            List<ReviewResponse> reviews = reviewService.getAllReviews(userId);
            return ResponseEntity.ok(reviews);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/admin/{reviewId}")
    public ResponseEntity<Map<String, Object>> deleteReviewByAdmin(@PathVariable Long reviewId) {
        try {
            reviewService.deleteReviewByAdmin(reviewId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Review deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsBySeller(
            @PathVariable Long sellerId,
            @RequestParam(required = false) Long userId) {
        try {
            List<ReviewResponse> reviews = reviewService.getReviewsBySeller(sellerId, userId);
            return ResponseEntity.ok(reviews);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/{reviewId}/like/{userId}")
    public ResponseEntity<Map<String, Object>> toggleLike(
            @PathVariable Long reviewId,
            @PathVariable Long userId) {
        try {
            reviewService.toggleLike(userId, reviewId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Like toggled successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}
