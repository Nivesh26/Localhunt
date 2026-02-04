package com.localhunts.backend.service;

import com.localhunts.backend.dto.ProductRequest;
import com.localhunts.backend.dto.ProductResponse;
import com.localhunts.backend.model.Payment;
import com.localhunts.backend.model.Product;
import com.localhunts.backend.model.Review;
import com.localhunts.backend.model.Seller;
import com.localhunts.backend.repository.CartRepository;
import com.localhunts.backend.repository.ChatRepository;
import com.localhunts.backend.repository.DeliveredRepository;
import com.localhunts.backend.repository.PaymentRepository;
import com.localhunts.backend.repository.ProductRepository;
import com.localhunts.backend.repository.ReviewLikeRepository;
import com.localhunts.backend.repository.ReviewRepository;
import com.localhunts.backend.repository.SellerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SellerRepository sellerRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private DeliveredRepository deliveredRepository;

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ReviewLikeRepository reviewLikeRepository;

    public ProductResponse createProduct(ProductRequest request) {
        // Find seller
        Seller seller = sellerRepository.findById(request.getSellerId())
            .orElseThrow(() -> new RuntimeException("Seller not found"));

        // Check if SKU already exists
        if (productRepository.existsBySku(request.getSku())) {
            throw new RuntimeException("SKU already exists");
        }

        // Create product
        Product product = new Product();
        product.setName(request.getName());
        product.setSku(request.getSku());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setCategory(request.getCategory());
        product.setDescription(request.getDescription());
        product.setImageUrl(request.getImageUrl());
        product.setSpecs(request.getSpecs());
        product.setSizeEu(request.getSizeEu());
        product.setSizeClothing(request.getSizeClothing());
        product.setSeller(seller);
        
        // Set status based on stock
        if (request.getStock() > 0) {
            product.setStatus("Live");
        } else {
            product.setStatus("Out of stock");
        }

        Product savedProduct = productRepository.save(product);
        return convertToResponse(savedProduct);
    }

    public List<ProductResponse> getAllProducts() {
        List<Product> products = productRepository.findAll();
        // Filter products to only show from active stores
        return products.stream()
            .filter(product -> product.getSeller().getStoreStatus() != null && product.getSeller().getStoreStatus())
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }

    public List<ProductResponse> getProductsBySeller(Long sellerId) {
        Seller seller = sellerRepository.findById(sellerId)
            .orElseThrow(() -> new RuntimeException("Seller not found"));
        List<Product> products = productRepository.findBySeller(seller);
        return products.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    /** Products removed from shop (Unlisted) for the "Removed from shop" page. */
    public List<ProductResponse> getRemovedProductsBySeller(Long sellerId) {
        return getProductsBySeller(sellerId).stream()
            .filter(p -> "Unlisted".equals(p.getStatus()))
            .collect(Collectors.toList());
    }

    public List<ProductResponse> getLiveProducts() {
        List<Product> products = productRepository.findByStatus("Live");
        // Filter products to only show from active stores
        return products.stream()
            .filter(product -> product.getSeller().getStoreStatus() != null && product.getSeller().getStoreStatus())
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }

    public ProductResponse getProductById(Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        // Unlisted products are not browsable (only visible in order tracking for buyers)
        if ("Unlisted".equals(product.getStatus())) {
            throw new RuntimeException("Product not found");
        }
        return convertToResponse(product);
    }

    public ProductResponse updateProduct(Long productId, ProductRequest request) {
        // Find existing product
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if SKU is being changed and if new SKU already exists (for a different product)
        if (!product.getSku().equals(request.getSku()) && productRepository.existsBySku(request.getSku())) {
            throw new RuntimeException("SKU already exists");
        }

        // Update product fields
        product.setName(request.getName());
        product.setSku(request.getSku());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setCategory(request.getCategory());
        product.setDescription(request.getDescription());
        product.setImageUrl(request.getImageUrl());
        product.setSpecs(request.getSpecs());
        product.setSizeEu(request.getSizeEu());
        product.setSizeClothing(request.getSizeClothing());
        
        // Update status based on stock
        if (request.getStock() > 0) {
            product.setStatus("Live");
        } else {
            product.setStatus("Out of stock");
        }

        Product updatedProduct = productRepository.save(product);
        return convertToResponse(updatedProduct);
    }

    /**
     * Delete product from shop (vendor or admin).
     * - If product is already Unlisted and has no pending payments: permanently delete (vendor can remove from "Removed from shop" when all delivered).
     * - If the product has been purchased (any Payment or Delivered) and is not Unlisted: only remove from shop (set status Unlisted).
     * - If the product was never purchased: permanently delete product and all related data.
     */
    @Transactional
    public void deleteProduct(Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));

        boolean hasPendingPayments = !paymentRepository.findByProduct(product).isEmpty();
        boolean hasDelivered = !deliveredRepository.findByProduct(product).isEmpty();

        // Already removed from shop but still has orders not yet delivered: cannot permanently delete yet
        if ("Unlisted".equals(product.getStatus()) && hasPendingPayments) {
            throw new RuntimeException("Cannot permanently delete: some orders are not yet delivered. You can delete this product once all orders are delivered.");
        }
        // Already removed from shop and no pending orders (all delivered or never sold): allow permanent delete
        if ("Unlisted".equals(product.getStatus()) && !hasPendingPayments) {
            doPermanentDeleteProduct(product);
            return;
        }

        boolean hasPurchases = hasPendingPayments || hasDelivered;

        if (hasPurchases) {
            // Product was bought by someone: remove from shop only, keep for order tracking
            cartRepository.deleteByProduct(product);
            product.setStatus("Unlisted");
            productRepository.save(product);
            return;
        }

        // Never purchased: full cascade delete
        doPermanentDeleteProduct(product);
    }

    /**
     * Super admin only: permanently delete product and all related data from the database.
     */
    @Transactional
    public void permanentDeleteProduct(Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        doPermanentDeleteProduct(product);
    }

    private void doPermanentDeleteProduct(Product product) {
        List<Review> productReviews = reviewRepository.findByProduct(product);
        for (Review review : productReviews) {
            reviewLikeRepository.deleteAll(reviewLikeRepository.findByReview(review));
        }
        reviewRepository.deleteAll(productReviews);
        chatRepository.deleteAll(chatRepository.findByProduct(product));
        cartRepository.deleteByProduct(product);
        List<Payment> payments = paymentRepository.findByProduct(product);
        for (Payment payment : payments) {
            if (payment.getProduct() != null) {
                Product p = payment.getProduct();
                int newStock = p.getStock() + payment.getQuantity();
                p.setStock(newStock);
                productRepository.save(p);
            }
        }
        paymentRepository.deleteAll(payments);
        deliveredRepository.deleteAll(deliveredRepository.findByProduct(product));
        productRepository.delete(product);
    }

    private ProductResponse convertToResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setSku(product.getSku());
        response.setPrice(product.getPrice());
        response.setStock(product.getStock());
        response.setCategory(product.getCategory());
        response.setDescription(product.getDescription());
        response.setImageUrl(product.getImageUrl());
        response.setStatus(product.getStatus());
        response.setSpecs(product.getSpecs());
        response.setSizeEu(product.getSizeEu());
        response.setSizeClothing(product.getSizeClothing());
        response.setSellerId(product.getSeller().getId());
        response.setSellerName(product.getSeller().getBusinessName());
        
        if (product.getCreatedAt() != null) {
            response.setCreatedAt(product.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }
        if (product.getUpdatedAt() != null) {
            response.setUpdatedAt(product.getUpdatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }
        
        return response;
    }
}
