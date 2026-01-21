package com.localhunts.backend.dto;

public class TopVendorResponse {
    private Long sellerId;
    private String businessName;
    private String businessCategory;
    private Long productCount;
    private Double growth;
    private Double rating;

    public TopVendorResponse() {
    }

    public TopVendorResponse(Long sellerId, String businessName, String businessCategory, Long productCount, Double growth, Double rating) {
        this.sellerId = sellerId;
        this.businessName = businessName;
        this.businessCategory = businessCategory;
        this.productCount = productCount;
        this.growth = growth;
        this.rating = rating;
    }

    // Getters and Setters
    public Long getSellerId() {
        return sellerId;
    }

    public void setSellerId(Long sellerId) {
        this.sellerId = sellerId;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getBusinessCategory() {
        return businessCategory;
    }

    public void setBusinessCategory(String businessCategory) {
        this.businessCategory = businessCategory;
    }

    public Long getProductCount() {
        return productCount;
    }

    public void setProductCount(Long productCount) {
        this.productCount = productCount;
    }

    public Double getGrowth() {
        return growth;
    }

    public void setGrowth(Double growth) {
        this.growth = growth;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }
}
