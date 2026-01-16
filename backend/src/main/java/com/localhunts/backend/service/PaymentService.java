package com.localhunts.backend.service;

import com.localhunts.backend.dto.CreateOrderRequest;
import com.localhunts.backend.dto.OrderResponse;
import com.localhunts.backend.model.Payment;
import com.localhunts.backend.model.Product;
import com.localhunts.backend.model.User;
import com.localhunts.backend.repository.PaymentRepository;
import com.localhunts.backend.repository.ProductRepository;
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
}
