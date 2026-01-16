package com.localhunts.backend.controller;

import com.localhunts.backend.dto.CreateOrderRequest;
import com.localhunts.backend.dto.OrderResponse;
import com.localhunts.backend.dto.OrderTrackingResponse;
import com.localhunts.backend.dto.UpdateOrderStatusRequest;
import com.localhunts.backend.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create-order/{userId}")
    public ResponseEntity<?> createOrder(
            @PathVariable Long userId,
            @Valid @RequestBody CreateOrderRequest request) {
        try {
            List<OrderResponse> orders = paymentService.createOrder(userId, request);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Order placed successfully!");
            response.put("orders", orders);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/orders/{userId}")
    public ResponseEntity<?> getUserOrders(@PathVariable Long userId) {
        try {
            List<OrderTrackingResponse> orders = paymentService.getUserOrders(userId);
            return ResponseEntity.ok(orders);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/seller-orders/{sellerId}")
    public ResponseEntity<?> getSellerOrders(@PathVariable Long sellerId) {
        try {
            List<OrderTrackingResponse> orders = paymentService.getSellerOrders(sellerId);
            return ResponseEntity.ok(orders);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PutMapping("/orders/{orderId}/status/{sellerId}")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @PathVariable Long sellerId,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        try {
            OrderTrackingResponse updatedOrder = paymentService.updateOrderStatus(orderId, request, sellerId);
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/orders/{orderId}/{userId}")
    public ResponseEntity<?> deleteOrder(
            @PathVariable Long orderId,
            @PathVariable Long userId) {
        try {
            paymentService.deleteOrder(orderId, userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Order removed from history");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @DeleteMapping("/seller-orders/{orderId}/{sellerId}")
    public ResponseEntity<?> deleteSellerOrder(
            @PathVariable Long orderId,
            @PathVariable Long sellerId) {
        try {
            paymentService.deleteSellerOrder(orderId, sellerId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Order removed from history");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}
