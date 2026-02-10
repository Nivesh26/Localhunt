package com.localhunts.backend.dto;

/**
 * Profit/commission breakdown per delivered order for super admin.
 * Shows product income and 20% admin commission from each delivered item.
 */
public class AdminProfitDetailResponse {
    private Long orderId;
    private String productName;
    private Long vendorId;
    private String vendorName;
    private Integer quantity;
    private Double unitPrice;
    private Double subtotal;      // Product income (quantity × unitPrice)
    private Double adminCommission; // 20% of subtotal - admin profit
    private String deliveredAt;
    private String customerName;
    private String paymentMethod; // "cod" or "esewa"

    public AdminProfitDetailResponse() {
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Long getVendorId() {
        return vendorId;
    }

    public void setVendorId(Long vendorId) {
        this.vendorId = vendorId;
    }

    public String getVendorName() {
        return vendorName;
    }

    public void setVendorName(String vendorName) {
        this.vendorName = vendorName;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(Double unitPrice) {
        this.unitPrice = unitPrice;
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }

    public Double getAdminCommission() {
        return adminCommission;
    }

    public void setAdminCommission(Double adminCommission) {
        this.adminCommission = adminCommission;
    }

    public String getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(String deliveredAt) {
        this.deliveredAt = deliveredAt;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
