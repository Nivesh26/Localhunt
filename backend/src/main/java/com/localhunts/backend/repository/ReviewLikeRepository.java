package com.localhunts.backend.repository;

import com.localhunts.backend.model.Review;
import com.localhunts.backend.model.ReviewLike;
import com.localhunts.backend.model.Seller;
import com.localhunts.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewLikeRepository extends JpaRepository<ReviewLike, Long> {
    Optional<ReviewLike> findByUserAndReview(User user, Review review);
    boolean existsByUserAndReview(User user, Review review);
    long countByReview(Review review);
    void deleteByUserAndReview(User user, Review review);
    List<ReviewLike> findByReview(Review review);
    
    // Vendor-specific methods
    Optional<ReviewLike> findByVendorAndReview(Seller vendor, Review review);
    boolean existsByVendorAndReview(Seller vendor, Review review);
    void deleteByVendorAndReview(Seller vendor, Review review);
    List<ReviewLike> findByReviewAndLikedByType(Review review, ReviewLike.LikedByType likedByType);
    List<ReviewLike> findByUser(User user);
    List<ReviewLike> findByVendor(Seller vendor);
}
