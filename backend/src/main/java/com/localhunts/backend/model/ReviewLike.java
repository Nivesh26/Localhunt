package com.localhunts.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "review_likes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "review_id"}),
    @UniqueConstraint(columnNames = {"vendor_id", "review_id"})
})
public class ReviewLike {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = true)
    private Seller vendor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    @Enumerated(EnumType.STRING)
    @Column(name = "liked_by_type", nullable = false)
    private LikedByType likedByType = LikedByType.USER;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        // Validation: ensure either user or vendor is set, but not both
        if (user == null && vendor == null) {
            throw new IllegalStateException("Either user or vendor must be set");
        }
        if (user != null && vendor != null) {
            throw new IllegalStateException("Cannot set both user and vendor");
        }
        // Ensure likedByType matches the set entity
        if (user != null && likedByType != LikedByType.USER) {
            likedByType = LikedByType.USER;
        }
        if (vendor != null && likedByType != LikedByType.VENDOR) {
            likedByType = LikedByType.VENDOR;
        }
    }

    public enum LikedByType {
        USER, VENDOR
    }

    public ReviewLike() {
    }

    public ReviewLike(User user, Review review) {
        this.user = user;
        this.review = review;
        this.likedByType = LikedByType.USER;
    }

    public ReviewLike(Seller vendor, Review review) {
        this.user = null; // Explicitly set to null for vendor likes
        this.vendor = vendor;
        this.review = review;
        this.likedByType = LikedByType.VENDOR;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Review getReview() {
        return review;
    }

    public void setReview(Review review) {
        this.review = review;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Seller getVendor() {
        return vendor;
    }

    public void setVendor(Seller vendor) {
        this.vendor = vendor;
    }

    public LikedByType getLikedByType() {
        return likedByType;
    }

    public void setLikedByType(LikedByType likedByType) {
        this.likedByType = likedByType;
    }
}
