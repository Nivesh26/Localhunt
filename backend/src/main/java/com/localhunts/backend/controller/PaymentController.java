package com.localhunts.backend.controller;

import com.localhunts.backend.dto.CreateOrderRequest;
import com.localhunts.backend.dto.EsewaInitRequest;
import com.localhunts.backend.dto.EsewaInitResponse;
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

    @PostMapping("/esewa-init/{userId}")
    public ResponseEntity<?> initEsewaPayment(
            @PathVariable Long userId,
            @Valid @RequestBody EsewaInitRequest request) {
        try {
            EsewaInitResponse response = paymentService.initEsewaPayment(userId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> body = new HashMap<>();
            body.put("success", false);
            body.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
        }
    }

    @PostMapping("/esewa-cancel-pending")
    public ResponseEntity<?> cancelEsewaPending(@RequestBody Map<String, Object> body) {
        String transactionUuid = body != null && body.get("transactionUuid") != null ? body.get("transactionUuid").toString() : null;
        Long userId = null;
        if (body != null && body.get("userId") != null) {
            if (body.get("userId") instanceof Number) {
                userId = ((Number) body.get("userId")).longValue();
            } else {
                try {
                    userId = Long.parseLong(body.get("userId").toString());
                } catch (NumberFormatException e) {
                    userId = null;
                }
            }
        }
        try {
            if (userId == null) {
                throw new RuntimeException("User ID required");
            }
            paymentService.cancelEsewaPendingOrders(transactionUuid, userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Pending orders cancelled");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PostMapping("/esewa-verify")
    public ResponseEntity<?> verifyEsewaPayment(@RequestBody Map<String, String> body) {
        String dataBase64 = body != null ? body.get("data") : null;
        try {
            paymentService.verifyEsewaPayment(dataBase64);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment verified successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

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

    @GetMapping("/seller-delivered-orders/{sellerId}")
    public ResponseEntity<?> getSellerDeliveredOrders(@PathVariable Long sellerId) {
        try {
            List<OrderTrackingResponse> orders = paymentService.getSellerDeliveredOrders(sellerId);
            return ResponseEntity.ok(orders);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/seller-delivered-orders-removed-products/{sellerId}")
    public ResponseEntity<?> getSellerDeliveredOrdersWithRemovedProduct(@PathVariable Long sellerId) {
        try {
            List<OrderTrackingResponse> orders = paymentService.getSellerDeliveredOrdersWithRemovedProduct(sellerId);
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

    @PutMapping("/orders/{orderId}/cancel/{userId}")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long orderId,
            @PathVariable Long userId) {
        try {
            paymentService.cancelOrder(orderId, userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Order cancelled successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
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
