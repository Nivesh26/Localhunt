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
     * Permanently delete a product and all related data (vendor or admin).
     * Removes: review likes on this product's reviews, reviews, chat messages, cart, payments (after restoring stock), delivered orders, then product.
     */
    @Transactional
    public void deleteProduct(Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));

        // 1. Delete review likes on reviews for this product, then delete the reviews
        List<Review> productReviews = reviewRepository.findByProduct(product);
        for (Review review : productReviews) {
            reviewLikeRepository.deleteAll(reviewLikeRepository.findByReview(review));
        }
        reviewRepository.deleteAll(productReviews);

        // 2. Delete all chat messages that reference this product
        chatRepository.deleteAll(chatRepository.findByProduct(product));

        // 3. Delete all cart items that reference this product
        cartRepository.deleteByProduct(product);

        // 4. Restore product stock and delete payment orders for this product
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

        // 5. Delete all delivered order records for this product
        deliveredRepository.deleteAll(deliveredRepository.findByProduct(product));

        // 6. Delete the product
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
