package com.localhunts.backend.dto;

public class AdminDashboardStats {
    private Long totalVendors;
    private Long activeProducts;
    private Double gmv30d;
    private Long pendingVerifications;
    /** Total commission earned (20% of delivered order subtotals). Paid only when order is delivered. */
    private Double totalCommission;

    public AdminDashboardStats() {
    }

    public AdminDashboardStats(Long totalVendors, Long activeProducts, Double gmv30d, Long pendingVerifications, Double totalCommission) {
        this.totalVendors = totalVendors;
        this.activeProducts = activeProducts;
        this.gmv30d = gmv30d;
        this.pendingVerifications = pendingVerifications;
        this.totalCommission = totalCommission != null ? totalCommission : 0.0;
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

    public Double getTotalCommission() {
        return totalCommission;
    }

    public void setTotalCommission(Double totalCommission) {
        this.totalCommission = totalCommission != null ? totalCommission : 0.0;
    }
}
