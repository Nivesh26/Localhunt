package com.localhunts.backend.service;

import com.localhunts.backend.dto.CreateOrderRequest;
import com.localhunts.backend.dto.EsewaInitRequest;
import com.localhunts.backend.dto.EsewaInitResponse;
import com.localhunts.backend.dto.OrderItemRequest;
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

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
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

    @Autowired
    private EmailService emailService;

    // Executor service for asynchronous email sending
    private final ExecutorService emailExecutor = Executors.newFixedThreadPool(5);

    // eSewa Epay V2 (UAT/Test)
    private static final String ESEWA_FORM_URL = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
    private static final String ESEWA_PRODUCT_CODE = "EPAYTEST";
    private static final String ESEWA_SECRET_KEY = "8gBm/:&EnhH.1/q";

    @Transactional
    public EsewaInitResponse initEsewaPayment(Long userId, EsewaInitRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        double amount = request.getAmount() != null ? request.getAmount() : 0;
        double taxAmount = request.getTaxAmount() != null ? request.getTaxAmount() : 0;
        double totalAmount = request.getTotalAmount() != null ? request.getTotalAmount() : (amount + taxAmount);

        if (totalAmount <= 0) {
            throw new RuntimeException("Invalid order amount");
        }

        String transactionUuid = "LH-" + UUID.randomUUID().toString().replace("-", "").substring(0, 20);

        List<Payment> payments = request.getItems().stream().map(itemRequest -> {
            Product product = productRepository.findById(itemRequest.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found: " + itemRequest.getProductId()));
            if (product.getStock() < itemRequest.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }
            int newStock = product.getStock() - itemRequest.getQuantity();
            product.setStock(newStock);
            productRepository.save(product);

            Payment payment = new Payment();
            payment.setUser(user);
            payment.setProduct(product);
            payment.setQuantity(itemRequest.getQuantity());
            payment.setUnitPrice(itemRequest.getUnitPrice());
            payment.setSubtotal(itemRequest.getUnitPrice() * itemRequest.getQuantity());
            payment.setPaymentMethod("esewa");
            payment.setRegion(request.getRegion());
            payment.setCity(request.getCity());
            payment.setArea(request.getArea());
            payment.setAddress(request.getAddress());
            payment.setStatus("Pending");
            payment.setEsewaTransactionUuid(transactionUuid);
            return paymentRepository.save(payment);
        }).collect(Collectors.toList());

        String signedFieldNames = "total_amount,transaction_uuid,product_code";
        String message = "total_amount=" + String.format("%.2f", totalAmount)
            + ",transaction_uuid=" + transactionUuid
            + ",product_code=" + ESEWA_PRODUCT_CODE;
        String signature = generateEsewaSignature(message, ESEWA_SECRET_KEY);

        Map<String, String> formData = new HashMap<>();
        formData.put("amount", String.format("%.2f", amount));
        formData.put("tax_amount", String.format("%.2f", taxAmount));
        formData.put("total_amount", String.format("%.2f", totalAmount));
        formData.put("transaction_uuid", transactionUuid);
        formData.put("product_code", ESEWA_PRODUCT_CODE);
        formData.put("product_service_charge", "0");
        formData.put("product_delivery_charge", "0");
        formData.put("success_url", request.getSuccessUrl());
        formData.put("failure_url", request.getFailureUrl());
        formData.put("signed_field_names", signedFieldNames);
        formData.put("signature", signature);

        return new EsewaInitResponse(ESEWA_FORM_URL, formData);
    }

    /**
     * Cancel pending eSewa orders when user returns from eSewa without paying.
     * Restores product stock and deletes the pending payment records so they disappear from vendor.
     */
    @Transactional
    public void cancelEsewaPendingOrders(String transactionUuid, Long userId) {
        if (transactionUuid == null || transactionUuid.isBlank()) {
            throw new RuntimeException("Invalid transaction reference");
        }
        List<Payment> payments = paymentRepository.findByEsewaTransactionUuid(transactionUuid);
        if (payments.isEmpty()) {
            return; // already cancelled or not found
        }
        if (!payments.get(0).getUser().getId().equals(userId)) {
            throw new RuntimeException("Order does not belong to this user");
        }
        for (Payment payment : payments) {
            if (payment.getProduct() != null) {
                Product product = payment.getProduct();
                product.setStock(product.getStock() + payment.getQuantity());
                productRepository.save(product);
            }
            paymentRepository.delete(payment);
        }
    }

    @Transactional
    public void verifyEsewaPayment(String dataBase64) {
        if (dataBase64 == null || dataBase64.isBlank()) {
            throw new RuntimeException("Invalid eSewa response data");
        }
        String json = new String(Base64.getDecoder().decode(dataBase64), StandardCharsets.UTF_8);
        // Parse key fields: status, signature, signed_field_names, transaction_uuid, total_amount, product_code
        String status = extractJsonValue(json, "status");
        String signature = extractJsonValue(json, "signature");
        String signedFieldNames = extractJsonValue(json, "signed_field_names");
        String transactionUuid = extractJsonValue(json, "transaction_uuid");
        String totalAmountStr = extractJsonValue(json, "total_amount");
        String productCode = extractJsonValue(json, "product_code");

        if (!"COMPLETE".equalsIgnoreCase(status)) {
            throw new RuntimeException("Payment was not successful. Status: " + status);
        }
        if (transactionUuid == null || transactionUuid.isBlank()) {
            throw new RuntimeException("Invalid transaction reference");
        }

        String message = buildSignatureMessage(json, signedFieldNames);
        String expectedSignature = generateEsewaSignature(message, ESEWA_SECRET_KEY);
        if (!expectedSignature.equals(signature)) {
            throw new RuntimeException("Invalid eSewa response signature");
        }

        List<Payment> payments = paymentRepository.findByEsewaTransactionUuid(transactionUuid);
        if (payments.isEmpty()) {
            throw new RuntimeException("Order not found for this transaction");
        }
        for (Payment p : payments) {
            p.setStatus("Paid");
            paymentRepository.save(p);
        }

        User user = payments.get(0).getUser();
        for (Payment payment : payments) {
            try {
                emailService.sendOrderConfirmationEmail(
                    user.getEmail(),
                    user.getFullName(),
                    payment.getId(),
                    payment.getProduct().getName(),
                    payment.getQuantity(),
                    payment.getSubtotal(),
                    payment.getPaymentMethod(),
                    payment.getAddress(),
                    payment.getArea(),
                    payment.getCity()
                );
            } catch (Exception e) {
                System.err.println("Failed to send order confirmation email: " + e.getMessage());
            }
        }
    }

    private String generateEsewaSignature(String message, String secretKey) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Failed to generate eSewa signature", e);
        }
    }

    private String extractJsonValue(String json, String key) {
        String search = "\"" + key + "\"";
        int start = json.indexOf(search);
        if (start == -1) return null;
        start = json.indexOf(":", start) + 1;
        int valueStart = start;
        while (valueStart < json.length() && (json.charAt(valueStart) == ' ' || json.charAt(valueStart) == '\t')) valueStart++;
        if (valueStart >= json.length()) return null;
        char first = json.charAt(valueStart);
        if (first == '"') {
            int end = json.indexOf('"', valueStart + 1);
            return end == -1 ? null : json.substring(valueStart + 1, end);
        }
        if (first == '-' || Character.isDigit(first)) {
            int end = valueStart + 1;
            while (end < json.length() && (Character.isDigit(json.charAt(end)) || json.charAt(end) == '.' || json.charAt(end) == '-')) end++;
            return json.substring(valueStart, end);
        }
        return null;
    }

    private String buildSignatureMessage(String json, String signedFieldNames) {
        if (signedFieldNames == null) return "";
        String[] fields = signedFieldNames.split(",");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < fields.length; i++) {
            String field = fields[i].trim();
            String value = extractJsonValue(json, field);
            if (value != null) {
                if (i > 0) sb.append(",");
                sb.append(field).append("=").append(value);
            }
        }
        return sb.toString();
    }

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

        // Send order confirmation emails
        for (Payment payment : payments) {
            try {
                emailService.sendOrderConfirmationEmail(
                    user.getEmail(),
                    user.getFullName(),
                    payment.getId(),
                    payment.getProduct().getName(),
                    payment.getQuantity(),
                    payment.getSubtotal(),
                    payment.getPaymentMethod(),
                    payment.getAddress(),
                    payment.getArea(),
                    payment.getCity()
                );
            } catch (Exception e) {
                // Log error but don't fail the order creation
                System.err.println("Failed to send order confirmation email: " + e.getMessage());
            }
        }

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
        // Filter out orders where product is null (product was deleted)
        List<Payment> payments = paymentRepository.findByUser(user);
        orders.addAll(payments.stream()
            .filter(payment -> !Boolean.TRUE.equals(payment.getHiddenFromUser()))
            .filter(payment -> payment.getProduct() != null) // Exclude orders with deleted products
            .map(this::convertToTrackingResponse)
            .collect(Collectors.toList()));
        
        // Get delivered orders from Delivered table
        // Filter out orders where product is null (product was deleted)
        List<Delivered> deliveredOrders = deliveredRepository.findByUser(user);
        orders.addAll(deliveredOrders.stream()
            .filter(delivered -> !Boolean.TRUE.equals(delivered.getHiddenFromUser()))
            .filter(delivered -> delivered.getProduct() != null) // Exclude orders with deleted products
            .map(this::convertDeliveredToResponse)
            .collect(Collectors.toList()));
        
        return orders;
    }

    private OrderTrackingResponse convertToTrackingResponse(Payment payment) {
        Product product = payment.getProduct();
        
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
        response.setOrderId(payment.getId());
        response.setProductId(productId);
        response.setProductName(productName);
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
        
        // Add seller name (business name) - only if product and seller exist
        if (product != null && product.getSeller() != null) {
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
        // Verify seller exists
        sellerRepository.findById(sellerId)
            .orElseThrow(() -> new RuntimeException("Seller not found"));

        // Get all payments and filter by seller (handling null products)
        List<Payment> allPayments = paymentRepository.findAll();
        List<Payment> payments = allPayments.stream()
            .filter(payment -> payment.getProduct() != null && 
                   payment.getProduct().getSeller() != null &&
                   payment.getProduct().getSeller().getId().equals(sellerId))
            .collect(Collectors.toList());
        
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

        // Verify that the order belongs to the seller (only if product exists)
        if (payment.getProduct() == null || payment.getProduct().getSeller() == null) {
            throw new RuntimeException("Product has been deleted. Cannot update order status.");
        }
        
        if (!payment.getProduct().getSeller().getId().equals(sellerId)) {
            throw new RuntimeException("Order does not belong to this seller");
        }

        if ("Cancelled".equals(payment.getStatus())) {
            throw new RuntimeException("This order was cancelled by the customer. No further action can be taken.");
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
            
            // Send delivery notification email asynchronously (don't block response)
            String userEmail = payment.getUser().getEmail();
            String userName = payment.getUser().getFullName();
            Long deliveredOrderId = payment.getId();
            String productName = payment.getProduct() != null ? payment.getProduct().getName() : "Product";
            String address = payment.getAddress();
            String area = payment.getArea();
            String city = payment.getCity();
            
            CompletableFuture.runAsync(() -> {
                try {
                    emailService.sendDeliveredEmail(userEmail, userName, deliveredOrderId, productName, address, area, city);
                } catch (Exception e) {
                    System.err.println("Failed to send delivery email: " + e.getMessage());
                }
            }, emailExecutor);
            
            // Delete from Payment table
            paymentRepository.delete(payment);
            
            // Return response from delivered order
            return convertDeliveredToResponse(delivered);
        } else if ("Ready to ship".equals(newStatus)) {
            // Update status for "Ready to ship" orders
            payment.setStatus(newStatus);
            Payment updatedPayment = paymentRepository.save(payment);
            
            // Send "Ready to ship" notification email asynchronously (don't block response)
            String userEmail = payment.getUser().getEmail();
            String userName = payment.getUser().getFullName();
            Long readyToShipOrderId = payment.getId();
            String productName = payment.getProduct() != null ? payment.getProduct().getName() : "Product";
            String address = payment.getAddress();
            String area = payment.getArea();
            String city = payment.getCity();
            
            CompletableFuture.runAsync(() -> {
                try {
                    emailService.sendReadyToShipEmail(userEmail, userName, readyToShipOrderId, productName, address, area, city);
                } catch (Exception e) {
                    System.err.println("Failed to send ready to ship email: " + e.getMessage());
                }
            }, emailExecutor);
            
            return convertToTrackingResponse(updatedPayment);
        } else {
            // Update status for other non-delivered orders
            payment.setStatus(newStatus);
            Payment updatedPayment = paymentRepository.save(payment);
            return convertToTrackingResponse(updatedPayment);
        }
    }

    /**
     * Cancel order (COD only). Allowed only when status is "Pending" (product is preparing).
     * Once seller marks "Ready to ship", cancellation is not allowed.
     * Restores product stock and sends cancellation emails to customer and vendor.
     */
    @Transactional
    public void cancelOrder(Long orderId, Long userId) {
        Payment payment = paymentRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!payment.getUser().getId().equals(userId)) {
            throw new RuntimeException("Order does not belong to this user");
        }

        if (!"cod".equalsIgnoreCase(payment.getPaymentMethod())) {
            throw new RuntimeException("Only Cash on Delivery orders can be cancelled");
        }

        if (!"Pending".equals(payment.getStatus())) {
            throw new RuntimeException("Order can only be cancelled while your product is preparing. Once the seller marks it as Ready to ship, cancellation is not allowed.");
        }

        // Restore product stock
        if (payment.getProduct() != null) {
            Product product = payment.getProduct();
            product.setStock(product.getStock() + payment.getQuantity());
            productRepository.save(product);
        }

        payment.setStatus("Cancelled");
        paymentRepository.save(payment);

        // Load all needed data while session is open (Product and Seller are LAZY)
        User user = payment.getUser();
        String customerName = user.getFullName();
        String customerEmail = user.getEmail();
        Long cancelledOrderId = payment.getId();
        String productName = payment.getProduct() != null ? payment.getProduct().getName() : "Product";
        String address = payment.getAddress();
        String area = payment.getArea();
        String city = payment.getCity();

        // Send vendor email first (synchronously so it is sent before response; avoids lazy-load issues)
        String vendorEmail = null;
        String vendorName = null;
        if (payment.getProduct() != null && payment.getProduct().getSeller() != null) {
            Seller seller = payment.getProduct().getSeller();
            vendorEmail = seller.getContactEmail();
            vendorName = seller.getBusinessName();
        }
        if (vendorEmail != null && !vendorEmail.isBlank()) {
            try {
                emailService.sendOrderCancelledEmailToVendor(vendorEmail, vendorName != null ? vendorName : "Vendor", cancelledOrderId, productName, customerName);
            } catch (Exception e) {
                System.err.println("Failed to send order cancellation email to vendor (" + vendorEmail + "): " + e.getMessage());
                e.printStackTrace();
            }
        }

        // Send customer email (async is fine; customer data already copied)
        if (customerEmail != null && !customerEmail.isBlank()) {
            final String fCustomerEmail = customerEmail;
            final String fCustomerName = customerName;
            final String fProductName = productName;
            final String fAddress = address;
            final String fArea = area;
            final String fCity = city;
            CompletableFuture.runAsync(() -> {
                try {
                    emailService.sendOrderCancelledEmailToCustomer(fCustomerEmail, fCustomerName, cancelledOrderId, fProductName, fAddress, fArea, fCity);
                } catch (Exception e) {
                    System.err.println("Failed to send order cancellation email to customer: " + e.getMessage());
                }
            }, emailExecutor);
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
        // Try Delivered table first (delivered orders)
        Delivered delivered = deliveredRepository.findById(orderId).orElse(null);
        if (delivered != null) {
            if (delivered.getProduct() != null && !delivered.getProduct().getSeller().getId().equals(sellerId)) {
                throw new RuntimeException("Order does not belong to this seller");
            }
            delivered.setHiddenFromSeller(true);
            deliveredRepository.save(delivered);
            return;
        }

        // Try Payment table (pending, ready to ship, or cancelled orders)
        Payment payment = paymentRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        if (payment.getProduct() == null || payment.getProduct().getSeller() == null) {
            throw new RuntimeException("Order does not belong to this seller");
        }
        if (!payment.getProduct().getSeller().getId().equals(sellerId)) {
            throw new RuntimeException("Order does not belong to this seller");
        }

        payment.setHiddenFromSeller(true);
        paymentRepository.save(payment);

        // If vendor deleted a cancelled order, send them a confirmation email
        if ("Cancelled".equals(payment.getStatus())) {
            Seller seller = payment.getProduct().getSeller();
            String vendorEmail = seller.getContactEmail();
            String vendorName = seller.getBusinessName();
            String productName = payment.getProduct().getName();
            if (vendorEmail != null && !vendorEmail.isBlank()) {
                try {
                    emailService.sendVendorCancelledOrderRemovedEmail(vendorEmail, vendorName, orderId, productName);
                } catch (Exception e) {
                    System.err.println("Failed to send vendor cancelled-order-removed email: " + e.getMessage());
                }
            }
        }
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
