package com.localhunts.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "chats")
public class Chat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private Seller seller;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private String senderType; // "USER" or "SELLER"

    @Column(nullable = false)
    private Boolean deletedByUser = false;

    @Column(nullable = false)
    private Boolean deletedBySeller = false;

    @Column(nullable = false)
    private Boolean readBySeller = false;

    @Column(nullable = false)
    private Boolean readByUser = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Chat() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Seller getSeller() {
        return seller;
    }

    public void setSeller(Seller seller) {
        this.seller = seller;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getSenderType() {
        return senderType;
    }

    public void setSenderType(String senderType) {
        this.senderType = senderType;
    }

    public Boolean getDeletedByUser() {
        return deletedByUser;
    }

    public void setDeletedByUser(Boolean deletedByUser) {
        this.deletedByUser = deletedByUser;
    }

    public Boolean getDeletedBySeller() {
        return deletedBySeller;
    }

    public void setDeletedBySeller(Boolean deletedBySeller) {
        this.deletedBySeller = deletedBySeller;
    }

    public Boolean getReadBySeller() {
        return readBySeller;
    }

    public void setReadBySeller(Boolean readBySeller) {
        this.readBySeller = readBySeller;
    }

    public Boolean getReadByUser() {
        return readByUser;
    }

    public void setReadByUser(Boolean readByUser) {
        this.readByUser = readByUser;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
