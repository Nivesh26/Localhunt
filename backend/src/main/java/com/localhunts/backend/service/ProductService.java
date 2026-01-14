package com.localhunts.backend.service;

import com.localhunts.backend.dto.ProductRequest;
import com.localhunts.backend.dto.ProductResponse;
import com.localhunts.backend.model.Product;
import com.localhunts.backend.model.Seller;
import com.localhunts.backend.repository.ProductRepository;
import com.localhunts.backend.repository.SellerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SellerRepository sellerRepository;

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
        return products.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    public List<ProductResponse> getProductsBySeller(Long sellerId) {
        Seller seller = sellerRepository.findById(sellerId)
            .orElseThrow(() -> new RuntimeException("Seller not found"));
        List<Product> products = productRepository.findBySeller(seller);
        return products.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    public List<ProductResponse> getLiveProducts() {
        List<Product> products = productRepository.findByStatus("Live");
        return products.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    public ProductResponse getProductById(Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        return convertToResponse(product);
    }

    public void deleteProduct(Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
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
