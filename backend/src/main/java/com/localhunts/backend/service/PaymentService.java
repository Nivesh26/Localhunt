package com.localhunts.backend.service;

import com.localhunts.backend.dto.CreateOrderRequest;
import com.localhunts.backend.dto.OrderResponse;
import com.localhunts.backend.dto.OrderTrackingResponse;
import com.localhunts.backend.dto.UpdateOrderStatusRequest;
import com.localhunts.backend.model.Payment;
import com.localhunts.backend.model.Product;
import com.localhunts.backend.model.Seller;
import com.localhunts.backend.model.User;
import com.localhunts.backend.repository.PaymentRepository;
import com.localhunts.backend.repository.ProductRepository;
import com.localhunts.backend.repository.SellerRepository;
import com.localhunts.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SellerRepository sellerRepository;

    @Transactional
    public List<OrderResponse> createOrder(Long userId, CreateOrderRequest request) {
        // Find user
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Create payment records for each item
        List<Payment> payments = request.getItems().stream().map(itemRequest -> {
            Product product = productRepository.findById(itemRequest.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found: " + itemRequest.getProductId()));

            Payment payment = new Payment();
            payment.setUser(user);
            payment.setProduct(product);
            payment.setQuantity(itemRequest.getQuantity());
            payment.setUnitPrice(itemRequest.getUnitPrice());
            payment.setSubtotal(itemRequest.getUnitPrice() * itemRequest.getQuantity());
            payment.setPaymentMethod(request.getPaymentMethod());
            payment.setRegion(request.getRegion());
            payment.setCity(request.getCity());
            payment.setArea(request.getArea());
            payment.setAddress(request.getAddress());
            payment.setStatus("Pending");

            return paymentRepository.save(payment);
        }).collect(Collectors.toList());

        // Convert to response DTOs
        return payments.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    private OrderResponse convertToResponse(Payment payment) {
        OrderResponse response = new OrderResponse();
        response.setOrderId(payment.getId());
        response.setProductId(payment.getProduct().getId());
        response.setProductName(payment.getProduct().getName());
        response.setQuantity(payment.getQuantity());
        response.setUnitPrice(payment.getUnitPrice());
        response.setSubtotal(payment.getSubtotal());
        response.setPaymentMethod(payment.getPaymentMethod());
        response.setStatus(payment.getStatus());
        
        if (payment.getCreatedAt() != null) {
            response.setCreatedAt(payment.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }
        
        return response;
    }

    public List<OrderTrackingResponse> getUserOrders(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        List<Payment> payments = paymentRepository.findByUser(user);
        // Filter out orders hidden from user
        return payments.stream()
            .filter(payment -> !Boolean.TRUE.equals(payment.getHiddenFromUser()))
            .map(this::convertToTrackingResponse)
            .collect(Collectors.toList());
    }

    private OrderTrackingResponse convertToTrackingResponse(Payment payment) {
        Product product = payment.getProduct();
        
        // Get first image from comma-separated imageUrl
        String imageUrl = product.getImageUrl() != null ? product.getImageUrl().split(",")[0].trim() : "";
        
        OrderTrackingResponse response = new OrderTrackingResponse();
        response.setOrderId(payment.getId());
        response.setProductId(product.getId());
        response.setProductName(product.getName());
        response.setProductImageUrl(imageUrl);
        response.setQuantity(payment.getQuantity());
        response.setUnitPrice(payment.getUnitPrice());
        response.setSubtotal(payment.getSubtotal());
        response.setPaymentMethod(payment.getPaymentMethod());
        response.setStatus(payment.getStatus());
        response.setRegion(payment.getRegion());
        response.setCity(payment.getCity());
        response.setArea(payment.getArea());
        response.setAddress(payment.getAddress());
        
        // Add seller name (business name)
        if (product.getSeller() != null) {
            response.setSellerName(product.getSeller().getBusinessName());
        }
        
        // Add customer information
        if (payment.getUser() != null) {
            response.setCustomerName(payment.getUser().getFullName());
            response.setCustomerEmail(payment.getUser().getEmail());
            response.setCustomerPhone(payment.getUser().getPhone());
        }
        
        if (payment.getCreatedAt() != null) {
            response.setCreatedAt(payment.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }
        
        return response;
    }

    public List<OrderTrackingResponse> getSellerOrders(Long sellerId) {
        Seller seller = sellerRepository.findById(sellerId)
            .orElseThrow(() -> new RuntimeException("Seller not found"));

        List<Payment> payments = paymentRepository.findBySeller(seller);
        // Filter out orders hidden from seller
        return payments.stream()
            .filter(payment -> !Boolean.TRUE.equals(payment.getHiddenFromSeller()))
            .map(this::convertToTrackingResponse)
            .collect(Collectors.toList());
    }

    @Transactional
    public OrderTrackingResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request, Long sellerId) {
        Payment payment = paymentRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));

        // Verify that the order belongs to the seller
        if (!payment.getProduct().getSeller().getId().equals(sellerId)) {
            throw new RuntimeException("Order does not belong to this seller");
        }

        // Validate status - only allow "Ready to ship" and "Delivered"
        String newStatus = request.getStatus();
        if (!"Ready to ship".equals(newStatus) && !"Delivered".equals(newStatus)) {
            throw new RuntimeException("Invalid status. Only 'Ready to ship' and 'Delivered' are allowed");
        }

        // Update status
        payment.setStatus(newStatus);
        Payment updatedPayment = paymentRepository.save(payment);

        return convertToTrackingResponse(updatedPayment);
    }

    @Transactional
    public void deleteOrder(Long orderId, Long userId) {
        Payment payment = paymentRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));

        // Verify that the order belongs to the user
        if (!payment.getUser().getId().equals(userId)) {
            throw new RuntimeException("Order does not belong to this user");
        }

        // Only allow hiding of delivered orders
        if (!"Delivered".equals(payment.getStatus())) {
            throw new RuntimeException("Only delivered orders can be removed from history");
        }

        // Mark as hidden from user instead of deleting
        payment.setHiddenFromUser(true);
        paymentRepository.save(payment);
    }

    @Transactional
    public void deleteSellerOrder(Long orderId, Long sellerId) {
        Payment payment = paymentRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));

        // Verify that the order belongs to the seller (product belongs to seller)
        if (!payment.getProduct().getSeller().getId().equals(sellerId)) {
            throw new RuntimeException("Order does not belong to this seller");
        }

        // Only allow hiding of delivered orders
        if (!"Delivered".equals(payment.getStatus())) {
            throw new RuntimeException("Only delivered orders can be removed from history");
        }

        // Mark as hidden from seller instead of deleting
        payment.setHiddenFromSeller(true);
        paymentRepository.save(payment);
    }
}
