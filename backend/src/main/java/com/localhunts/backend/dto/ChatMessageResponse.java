package com.localhunts.backend.dto;

import java.time.LocalDateTime;

public class ChatMessageResponse {
    private Long id;
    private Long productId;
    private String productName;
    private Long userId;
    private String userName;
    private Long sellerId;
    private String sellerName;
    private String message;
    private String senderType;
    private LocalDateTime createdAt;
    private Boolean deletedByUser;
    private Boolean deletedBySeller;
    private String userProfilePicture;
    private String sellerProfilePicture;

    public ChatMessageResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Long getSellerId() {
        return sellerId;
    }

    public void setSellerId(Long sellerId) {
        this.sellerId = sellerId;
    }

    public String getSellerName() {
        return sellerName;
    }

    public void setSellerName(String sellerName) {
        this.sellerName = sellerName;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
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

    public String getUserProfilePicture() {
        return userProfilePicture;
    }

    public void setUserProfilePicture(String userProfilePicture) {
        this.userProfilePicture = userProfilePicture;
    }

    public String getSellerProfilePicture() {
        return sellerProfilePicture;
    }

    public void setSellerProfilePicture(String sellerProfilePicture) {
        this.sellerProfilePicture = sellerProfilePicture;
    }
}
