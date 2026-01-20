package com.localhunts.backend.service;

import com.localhunts.backend.dto.ReviewRequest;
import com.localhunts.backend.dto.ReviewResponse;
import com.localhunts.backend.model.Product;
import com.localhunts.backend.model.Review;
import com.localhunts.backend.model.User;
import com.localhunts.backend.repository.ProductRepository;
import com.localhunts.backend.repository.ReviewRepository;
import com.localhunts.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public ReviewResponse createReview(Long userId, ReviewRequest request) {
        // Find user
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Find product
        Product product = productRepository.findById(request.getProductId())
            .orElseThrow(() -> new RuntimeException("Product not found"));

        // Create review (users can now submit multiple reviews)
        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setRating(request.getRating());
        review.setReviewText(request.getReviewText());

        Review savedReview = reviewRepository.save(review);
        return convertToResponse(savedReview);
    }

    public List<ReviewResponse> getReviewsByProduct(Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));

        List<Review> reviews = reviewRepository.findByProductOrderByCreatedAtDesc(product);
        return reviews.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }

    public boolean hasUserReviewed(Long userId, Long productId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));

        return reviewRepository.existsByUserAndProduct(user, product);
    }

    public Double getAverageRating(Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));

        List<Review> reviews = reviewRepository.findByProduct(product);
        if (reviews.isEmpty()) {
            return null;
        }

        double sum = reviews.stream()
            .mapToInt(Review::getRating)
            .sum();
        return sum / reviews.size();
    }

    @Transactional
    public void deleteReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new RuntimeException("Review not found"));

        // Check if the user owns this review
        if (!review.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only delete your own reviews");
        }

        reviewRepository.delete(review);
    }

    private ReviewResponse convertToResponse(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setUserId(review.getUser().getId());
        response.setUserName(review.getUser().getFullName());
        response.setUserProfilePicture(review.getUser().getProfilePicture());
        response.setProductId(review.getProduct().getId());
        response.setProductName(review.getProduct().getName());
        response.setRating(review.getRating());
        response.setReviewText(review.getReviewText());

        if (review.getCreatedAt() != null) {
            response.setCreatedAt(review.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }
        if (review.getUpdatedAt() != null) {
            response.setUpdatedAt(review.getUpdatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }

        return response;
    }
}
