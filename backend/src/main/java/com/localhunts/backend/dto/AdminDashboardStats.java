package com.localhunts.backend.dto;

public class AdminDashboardStats {
    private Long totalVendors;
    private Long activeProducts;
    private Double gmv30d;
    private Long pendingVerifications;

    public AdminDashboardStats() {
    }

    public AdminDashboardStats(Long totalVendors, Long activeProducts, Double gmv30d, Long pendingVerifications) {
        this.totalVendors = totalVendors;
        this.activeProducts = activeProducts;
        this.gmv30d = gmv30d;
        this.pendingVerifications = pendingVerifications;
    }

    // Getters and Setters
    public Long getTotalVendors() {
        return totalVendors;
    }

    public void setTotalVendors(Long totalVendors) {
        this.totalVendors = totalVendors;
    }

    public Long getActiveProducts() {
        return activeProducts;
    }

    public void setActiveProducts(Long activeProducts) {
        this.activeProducts = activeProducts;
    }

    public Double getGmv30d() {
        return gmv30d;
    }

    public void setGmv30d(Double gmv30d) {
        this.gmv30d = gmv30d;
    }

    public Long getPendingVerifications() {
        return pendingVerifications;
    }

    public void setPendingVerifications(Long pendingVerifications) {
        this.pendingVerifications = pendingVerifications;
    }
}
