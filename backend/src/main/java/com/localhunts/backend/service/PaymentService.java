package com.localhunts.backend.service;

import com.localhunts.backend.dto.CreateOrderRequest;
import com.localhunts.backend.dto.OrderResponse;
import com.localhunts.backend.dto.OrderTrackingResponse;
import com.localhunts.backend.dto.UpdateOrderStatusRequest;
import com.localhunts.backend.model.Delivered;
import com.localhunts.backend.model.Payment;
import com.localhunts.backend.model.Product;
import com.localhunts.backend.model.Seller;
import com.localhunts.backend.model.User;
import com.localhunts.backend.repository.DeliveredRepository;
import com.localhunts.backend.repository.PaymentRepository;
import com.localhunts.backend.repository.ProductRepository;
import com.localhunts.backend.repository.SellerRepository;
import com.localhunts.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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

    @Autowired
    private DeliveredRepository deliveredRepository;

    @Transactional
    public List<OrderResponse> createOrder(Long userId, CreateOrderRequest request) {
        // Find user
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Create payment records for each item and reduce stock
        List<Payment> payments = request.getItems().stream().map(itemRequest -> {
            Product product = productRepository.findById(itemRequest.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found: " + itemRequest.getProductId()));

            // Check if there's enough stock
            if (product.getStock() < itemRequest.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName() + 
                    ". Available: " + product.getStock() + ", Requested: " + itemRequest.getQuantity());
            }

            // Reduce stock by the quantity ordered
            int newStock = product.getStock() - itemRequest.getQuantity();
            product.setStock(newStock);
            productRepository.save(product);

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

        List<OrderTrackingResponse> orders = new java.util.ArrayList<>();
        
        // Get non-delivered orders from Payment table
        List<Payment> payments = paymentRepository.findByUser(user);
        orders.addAll(payments.stream()
            .filter(payment -> !Boolean.TRUE.equals(payment.getHiddenFromUser()))
            .map(this::convertToTrackingResponse)
            .collect(Collectors.toList()));
        
        // Get delivered orders from Delivered table
        List<Delivered> deliveredOrders = deliveredRepository.findByUser(user);
        orders.addAll(deliveredOrders.stream()
            .filter(delivered -> !Boolean.TRUE.equals(delivered.getHiddenFromUser()))
            .map(this::convertDeliveredToResponse)
            .collect(Collectors.toList()));
        
        return orders;
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
        // Filter out orders hidden from seller and exclude delivered orders (they're in Delivered table)
        return payments.stream()
            .filter(payment -> !Boolean.TRUE.equals(payment.getHiddenFromSeller()))
            .filter(payment -> !"Delivered".equals(payment.getStatus()))
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

        if ("Delivered".equals(newStatus)) {
            // Move order to Delivered table
            Delivered delivered = new Delivered();
            delivered.setUser(payment.getUser());
            delivered.setProduct(payment.getProduct());
            delivered.setQuantity(payment.getQuantity());
            delivered.setUnitPrice(payment.getUnitPrice());
            delivered.setSubtotal(payment.getSubtotal());
            delivered.setPaymentMethod(payment.getPaymentMethod());
            delivered.setRegion(payment.getRegion());
            delivered.setCity(payment.getCity());
            delivered.setArea(payment.getArea());
            delivered.setAddress(payment.getAddress());
            delivered.setHiddenFromUser(payment.getHiddenFromUser());
            delivered.setHiddenFromSeller(payment.getHiddenFromSeller());
            delivered.setDeliveredAt(LocalDateTime.now());
            
            deliveredRepository.save(delivered);
            
            // Delete from Payment table
            paymentRepository.delete(payment);
            
            // Return response from delivered order
            return convertDeliveredToResponse(delivered);
        } else {
            // Update status for non-delivered orders
            payment.setStatus(newStatus);
            Payment updatedPayment = paymentRepository.save(payment);
            return convertToTrackingResponse(updatedPayment);
        }
    }

    @Transactional
    public void deleteOrder(Long orderId, Long userId) {
        // Try to find in Delivered table first (delivered orders)
        Delivered delivered = deliveredRepository.findById(orderId).orElse(null);
        
        if (delivered != null) {
            // Verify that the order belongs to the user
            if (!delivered.getUser().getId().equals(userId)) {
                throw new RuntimeException("Order does not belong to this user");
            }

            // Mark as hidden from user instead of deleting
            delivered.setHiddenFromUser(true);
            deliveredRepository.save(delivered);
            return;
        }
        
        // If not found in Delivered, try Payment table (non-delivered orders)
        Payment payment = paymentRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));

        // Verify that the order belongs to the user
        if (!payment.getUser().getId().equals(userId)) {
            throw new RuntimeException("Order does not belong to this user");
        }

        // Only allow hiding of delivered orders (but if it's in Payment, it's not delivered yet)
        // Actually, users can hide any order from their view
        payment.setHiddenFromUser(true);
        paymentRepository.save(payment);
    }

    @Transactional
    public void deleteSellerOrder(Long orderId, Long sellerId) {
        Delivered delivered = deliveredRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));

        // Verify that the order belongs to the seller (product belongs to seller)
        // If product is null (product was deleted), we can't verify ownership
        if (delivered.getProduct() != null) {
            if (!delivered.getProduct().getSeller().getId().equals(sellerId)) {
                throw new RuntimeException("Order does not belong to this seller");
            }
        }

        // Mark as hidden from seller instead of deleting
        delivered.setHiddenFromSeller(true);
        deliveredRepository.save(delivered);
    }

    public List<OrderTrackingResponse> getSellerDeliveredOrders(Long sellerId) {
        Seller seller = sellerRepository.findById(sellerId)
            .orElseThrow(() -> new RuntimeException("Seller not found"));

        List<Delivered> deliveredOrders = deliveredRepository.findBySeller(seller);
        // Filter out orders hidden from seller
        return deliveredOrders.stream()
            .filter(delivered -> !Boolean.TRUE.equals(delivered.getHiddenFromSeller()))
            .map(this::convertDeliveredToResponse)
            .collect(Collectors.toList());
    }

    private OrderTrackingResponse convertDeliveredToResponse(Delivered delivered) {
        Product product = delivered.getProduct();
        
        // Get first image from comma-separated imageUrl (if product exists)
        String imageUrl = "";
        String productName = "Product Deleted";
        Long productId = null;
        
        if (product != null) {
            imageUrl = product.getImageUrl() != null ? product.getImageUrl().split(",")[0].trim() : "";
            productName = product.getName();
            productId = product.getId();
        }
        
        OrderTrackingResponse response = new OrderTrackingResponse();
        response.setOrderId(delivered.getId());
        response.setProductId(productId);
        response.setProductName(productName);
        response.setProductImageUrl(imageUrl);
        response.setQuantity(delivered.getQuantity());
        response.setUnitPrice(delivered.getUnitPrice());
        response.setSubtotal(delivered.getSubtotal());
        response.setPaymentMethod(delivered.getPaymentMethod());
        response.setStatus("Delivered");
        response.setRegion(delivered.getRegion());
        response.setCity(delivered.getCity());
        response.setArea(delivered.getArea());
        response.setAddress(delivered.getAddress());
        
        // Add seller name (business name) - only if product and seller exist
        if (product != null && product.getSeller() != null) {
            response.setSellerName(product.getSeller().getBusinessName());
        }
        
        // Add customer information
        if (delivered.getUser() != null) {
            response.setCustomerName(delivered.getUser().getFullName());
            response.setCustomerEmail(delivered.getUser().getEmail());
            response.setCustomerPhone(delivered.getUser().getPhone());
        }
        
        if (delivered.getCreatedAt() != null) {
            response.setCreatedAt(delivered.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }
        
        return response;
    }
}
