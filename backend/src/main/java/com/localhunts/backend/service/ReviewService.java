package com.localhunts.backend.service;

import com.localhunts.backend.dto.ReviewRequest;
import com.localhunts.backend.dto.ReviewResponse;
import com.localhunts.backend.model.Product;
import com.localhunts.backend.model.Review;
import com.localhunts.backend.model.ReviewLike;
import com.localhunts.backend.model.User;
import com.localhunts.backend.repository.ProductRepository;
import com.localhunts.backend.repository.ReviewLikeRepository;
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

    @Autowired
    private ReviewLikeRepository reviewLikeRepository;

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
        return convertToResponse(savedReview, null);
    }

    public List<ReviewResponse> getReviewsByProduct(Long productId, Long userId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));

        List<Review> reviews = reviewRepository.findByProductOrderByCreatedAtDesc(product);
        return reviews.stream()
            .map(review -> convertToResponse(review, userId))
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

    public List<ReviewResponse> getAllReviews(Long userId) {
        List<Review> reviews = reviewRepository.findAllByOrderByCreatedAtDesc();
        return reviews.stream()
            .map(review -> convertToResponse(review, userId))
            .collect(Collectors.toList());
    }

    public List<ReviewResponse> getReviewsBySeller(Long sellerId, Long userId) {
        List<Review> reviews = reviewRepository.findByProductSellerIdOrderByCreatedAtDesc(sellerId);
        return reviews.stream()
            .map(review -> convertToResponse(review, userId))
            .collect(Collectors.toList());
    }

    @Transactional
    public void deleteReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new RuntimeException("Review not found"));

        // Check if the user owns this review
        if (!review.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only delete your own reviews");
        }

        // Delete all likes associated with this review first
        List<ReviewLike> reviewLikes = reviewLikeRepository.findByReview(review);
        reviewLikeRepository.deleteAll(reviewLikes);

        // Now delete the review
        reviewRepository.delete(review);
    }

    @Transactional
    public void deleteReviewByAdmin(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new RuntimeException("Review not found"));
        
        // Delete all likes associated with this review first
        List<ReviewLike> reviewLikes = reviewLikeRepository.findByReview(review);
        reviewLikeRepository.deleteAll(reviewLikes);

        // Now delete the review
        reviewRepository.delete(review);
    }

    @Transactional
    public void toggleLike(Long userId, Long reviewId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new RuntimeException("Review not found"));

        ReviewLike existingLike = reviewLikeRepository.findByUserAndReview(user, review).orElse(null);
        
        if (existingLike != null) {
            // Unlike: remove the like
            reviewLikeRepository.delete(existingLike);
        } else {
            // Like: create a new like
            ReviewLike like = new ReviewLike(user, review);
            reviewLikeRepository.save(like);
        }
    }

    public boolean hasUserLiked(Long userId, Long reviewId) {
        if (userId == null) {
            return false;
        }
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return false;
        }
        Review review = reviewRepository.findById(reviewId).orElse(null);
        if (review == null) {
            return false;
        }
        return reviewLikeRepository.existsByUserAndReview(user, review);
    }

    private ReviewResponse convertToResponse(Review review, Long currentUserId) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setUserId(review.getUser().getId());
        response.setUserName(review.getUser().getFullName());
        response.setUserProfilePicture(review.getUser().getProfilePicture());
        response.setProductId(review.getProduct().getId());
        response.setProductName(review.getProduct().getName());
        
        // Set product image URL (get first image from comma-separated string)
        String productImageUrl = review.getProduct().getImageUrl();
        if (productImageUrl != null && !productImageUrl.isEmpty()) {
            String firstImage = productImageUrl.split(",")[0].trim();
            response.setProductImageUrl(firstImage);
        }
        
        response.setRating(review.getRating());
        response.setReviewText(review.getReviewText());

        if (review.getCreatedAt() != null) {
            response.setCreatedAt(review.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }
        if (review.getUpdatedAt() != null) {
            response.setUpdatedAt(review.getUpdatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }

        // Set like count
        long likeCount = reviewLikeRepository.countByReview(review);
        response.setLikeCount(likeCount);

        // Set user liked status
        boolean userLiked = currentUserId != null && hasUserLiked(currentUserId, review.getId());
        response.setUserLiked(userLiked);

        return response;
    }
}
