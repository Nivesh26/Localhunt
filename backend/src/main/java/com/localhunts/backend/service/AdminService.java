package com.localhunts.backend.service;

import com.localhunts.backend.dto.AdminDashboardStats;
import com.localhunts.backend.dto.AdminProfitDetailResponse;
import com.localhunts.backend.dto.OnboardingRequestResponse;
import com.localhunts.backend.dto.TopVendorResponse;
import com.localhunts.backend.model.Delivered;
import com.localhunts.backend.model.Payment;
import com.localhunts.backend.model.Product;
import com.localhunts.backend.model.Seller;
import com.localhunts.backend.repository.DeliveredRepository;
import com.localhunts.backend.repository.PaymentRepository;
import com.localhunts.backend.repository.ProductRepository;
import com.localhunts.backend.repository.SellerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private SellerRepository sellerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private DeliveredRepository deliveredRepository;

    public AdminDashboardStats getDashboardStats() {
        // Total vendors (approved sellers)
        Long totalVendors = (long) sellerRepository.findByApprovedTrue().size();

        // Active products (status = "Live")
        Long activeProducts = (long) productRepository.findByStatus("Live").size();

        // GMV (30 days) - sum of subtotals from payments created in last 30 days
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Payment> recentPayments = paymentRepository.findAll().stream()
            .filter(p -> p.getCreatedAt() != null && p.getCreatedAt().isAfter(thirtyDaysAgo))
            .filter(p -> !p.getStatus().equals("Cancelled"))
            .collect(Collectors.toList());
        Double gmv30d = recentPayments.stream()
            .mapToDouble(Payment::getSubtotal)
            .sum();

        // Pending verifications (sellers with approved = false)
        Long pendingVerifications = (long) sellerRepository.findByApprovedFalse().size();

        // Super admin commission: 20% of subtotal from all delivered orders (paid only when delivered)
        Double totalCommission = deliveredRepository.getTotalAdminCommission();
        if (totalCommission == null) totalCommission = 0.0;

        return new AdminDashboardStats(totalVendors, activeProducts, gmv30d, pendingVerifications, totalCommission);
    }

    public List<TopVendorResponse> getTopVendors() {
        List<Seller> approvedSellers = sellerRepository.findByApprovedTrue();
        
        return approvedSellers.stream()
            .map(seller -> {
                // Count products for this seller (only Live products)
                List<Product> sellerProducts = productRepository.findBySeller(seller);
                Long productCount = sellerProducts.stream()
                    .filter(p -> "Live".equals(p.getStatus()))
                    .count();
                
                // Calculate growth (simplified - could be improved with historical data)
                Double growth = 0.0;
                if (productCount > 0) {
                    // Simple growth calculation (can be enhanced)
                    growth = Math.random() * 20 + 5; // Random between 5-25% for demo
                }
                
                // Default rating (could be calculated from reviews if available)
                Double rating = 4.5 + Math.random() * 0.5; // Random between 4.5-5.0
                
                return new TopVendorResponse(
                    seller.getId(),
                    seller.getBusinessName(),
                    seller.getBusinessCategory(),
                    productCount,
                    growth,
                    rating
                );
            })
            .filter(v -> v.getProductCount() > 0) // Only show vendors with products
            .sorted((a, b) -> Long.compare(b.getProductCount(), a.getProductCount())) // Sort by product count descending
            .limit(4) // Top 4 vendors
            .collect(Collectors.toList());
    }

    public List<OnboardingRequestResponse> getOnboardingRequests() {
        List<Seller> pendingSellers = sellerRepository.findByApprovedFalse();
        
        return pendingSellers.stream()
            .map(seller -> {
                // Determine document status
                String documents = "Complete";
                if (seller.getBusinessRegistrationCertificate() == null || seller.getBusinessRegistrationCertificate().isEmpty()) {
                    documents = "Registration Certificate Pending";
                } else if (seller.getPanVatCertificate() == null || seller.getPanVatCertificate().isEmpty()) {
                    documents = "PAN/VAT Certificate Pending";
                }
                
                // Determine status based on documents
                String status = "Ready to Approve";
                if (documents.contains("Pending")) {
                    status = "Documents Pending";
                } else {
                    // Check how long ago it was submitted
                    if (seller.getCreatedAt() != null) {
                        long hoursAgo = java.time.Duration.between(seller.getCreatedAt(), LocalDateTime.now()).toHours();
                        if (hoursAgo < 2) {
                            status = "High Priority";
                        } else if (hoursAgo < 12) {
                            status = "Follow-up";
                        }
                    }
                }
                
                // Format submitted time
                String submittedAt = "Unknown";
                if (seller.getCreatedAt() != null) {
                    LocalDateTime createdAt = seller.getCreatedAt();
                    LocalDateTime now = LocalDateTime.now();
                    long hoursAgo = java.time.Duration.between(createdAt, now).toHours();
                    
                    if (hoursAgo < 1) {
                        long minutesAgo = java.time.Duration.between(createdAt, now).toMinutes();
                        submittedAt = minutesAgo + (minutesAgo == 1 ? " minute ago" : " minutes ago");
                    } else if (hoursAgo < 24) {
                        submittedAt = hoursAgo + (hoursAgo == 1 ? " hour ago" : " hours ago");
                    } else {
                        long daysAgo = hoursAgo / 24;
                        submittedAt = daysAgo + (daysAgo == 1 ? " day ago" : " days ago");
                    }
                }
                
                return new OnboardingRequestResponse(
                    seller.getId(),
                    seller.getBusinessName(),
                    seller.getUserName(),
                    submittedAt,
                    documents,
                    status
                );
            })
            .sorted((a, b) -> {
                // Sort by priority: High Priority > Follow-up > Ready to Approve > Documents Pending
                int priorityA = getPriority(a.getStatus());
                int priorityB = getPriority(b.getStatus());
                return Integer.compare(priorityB, priorityA);
            })
            .limit(3) // Show top 3
            .collect(Collectors.toList());
    }

    private int getPriority(String status) {
        switch (status) {
            case "High Priority": return 4;
            case "Follow-up": return 3;
            case "Ready to Approve": return 2;
            case "Documents Pending": return 1;
            default: return 0;
        }
    }

    /**
     * Get detailed profit/commission breakdown for super admin.
     * Lists every delivered order with product income and 20% admin commission.
     */
    public List<AdminProfitDetailResponse> getAdminProfitDetails() {
        List<Delivered> delivered = deliveredRepository.findAll();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        return delivered.stream()
            .filter(d -> d.getProduct() != null) // Exclude orders with deleted products
            .map(d -> {
                AdminProfitDetailResponse r = new AdminProfitDetailResponse();
                r.setOrderId(d.getId());
                r.setProductName(d.getProduct().getName());
                if (d.getProduct().getSeller() != null) {
                    r.setVendorId(d.getProduct().getSeller().getId());
                    r.setVendorName(d.getProduct().getSeller().getBusinessName());
                } else {
                    r.setVendorName("—");
                }
                r.setQuantity(d.getQuantity());
                r.setUnitPrice(d.getUnitPrice());
                r.setSubtotal(d.getSubtotal());
                r.setAdminCommission(d.getSubtotal() * 0.2); // 20% commission
                r.setDeliveredAt(d.getDeliveredAt() != null ? d.getDeliveredAt().format(formatter) : "—");
                r.setCustomerName(d.getUser() != null ? d.getUser().getFullName() : "—");
                String pm = d.getPaymentMethod();
                r.setPaymentMethod(pm != null && !pm.isBlank() && pm.toLowerCase().replace("-", "").contains("esewa") ? "esewa" : "cod");
                return r;
            })
            .sorted((a, b) -> Long.compare(b.getOrderId(), a.getOrderId())) // Newest first (higher ID = more recent)
            .collect(Collectors.toList());
    }
}
