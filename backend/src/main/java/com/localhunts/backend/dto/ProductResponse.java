package com.localhunts.backend.dto;

public class ProductResponse {
    private Long id;
    private String name;
    private String sku;
    private Double price;
    private Integer stock;
    private String category;
    private String description;
    private String imageUrl;
    private String status;
    private String specs;
    private String sizeEu;
    private String sizeClothing;
    private Long sellerId;
    private String sellerName;
    private Boolean sellerStoreClosed; // true when vendor/admin closed the store
    private String createdAt;
    private String updatedAt;

    public ProductResponse() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSpecs() {
        return specs;
    }

    public void setSpecs(String specs) {
        this.specs = specs;
    }

    public String getSizeEu() {
        return sizeEu;
    }

    public void setSizeEu(String sizeEu) {
        this.sizeEu = sizeEu;
    }

    public String getSizeClothing() {
        return sizeClothing;
    }

    public void setSizeClothing(String sizeClothing) {
        this.sizeClothing = sizeClothing;
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

    public Boolean getSellerStoreClosed() {
        return sellerStoreClosed;
    }

    public void setSellerStoreClosed(Boolean sellerStoreClosed) {
        this.sellerStoreClosed = sellerStoreClosed;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
}
