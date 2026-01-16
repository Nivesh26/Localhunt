package com.localhunts.backend.service;

import com.localhunts.backend.dto.CartItemRequest;
import com.localhunts.backend.dto.CartItemResponse;
import com.localhunts.backend.model.Cart;
import com.localhunts.backend.model.Product;
import com.localhunts.backend.model.User;
import com.localhunts.backend.repository.CartRepository;
import com.localhunts.backend.repository.ProductRepository;
import com.localhunts.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    public CartItemResponse addToCart(Long userId, CartItemRequest request) {
        // Find user
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Find product
        Product product = productRepository.findById(request.getProductId())
            .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if product is in stock
        if (product.getStock() < request.getQuantity()) {
            throw new RuntimeException("Insufficient stock. Available: " + product.getStock());
        }

        // Check if item already exists in cart
        Optional<Cart> existingCart = cartRepository.findByUserAndProduct(user, product);
        
        if (existingCart.isPresent()) {
            // Update quantity
            Cart cart = existingCart.get();
            int newQuantity = cart.getQuantity() + request.getQuantity();
            
            // Check stock availability
            if (product.getStock() < newQuantity) {
                throw new RuntimeException("Insufficient stock. Available: " + product.getStock());
            }
            
            cart.setQuantity(newQuantity);
            Cart savedCart = cartRepository.save(cart);
            return convertToResponse(savedCart);
        } else {
            // Create new cart item
            Cart cart = new Cart(user, product, request.getQuantity());
            Cart savedCart = cartRepository.save(cart);
            return convertToResponse(savedCart);
        }
    }

    public List<CartItemResponse> getCartItems(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Cart> carts = cartRepository.findByUser(user);
        return carts.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    public CartItemResponse updateCartItem(Long userId, Long cartId, Integer quantity) {
        // Verify user exists
        userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Cart cart = cartRepository.findById(cartId)
            .orElseThrow(() -> new RuntimeException("Cart item not found"));

        // Verify cart belongs to user
        if (!cart.getUser().getId().equals(userId)) {
            throw new RuntimeException("Cart item does not belong to user");
        }

        // Check stock availability
        if (cart.getProduct().getStock() < quantity) {
            throw new RuntimeException("Insufficient stock. Available: " + cart.getProduct().getStock());
        }

        cart.setQuantity(quantity);
        Cart updatedCart = cartRepository.save(cart);
        return convertToResponse(updatedCart);
    }

    public void removeCartItem(Long userId, Long cartId) {
        // Verify user exists
        userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Cart cart = cartRepository.findById(cartId)
            .orElseThrow(() -> new RuntimeException("Cart item not found"));

        // Verify cart belongs to user
        if (!cart.getUser().getId().equals(userId)) {
            throw new RuntimeException("Cart item does not belong to user");
        }

        cartRepository.delete(cart);
    }

    public void clearCart(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        cartRepository.deleteByUser(user);
    }

    private CartItemResponse convertToResponse(Cart cart) {
        Product product = cart.getProduct();
        Double subtotal = product.getPrice() * cart.getQuantity();
        
        // Get first image from comma-separated imageUrl
        String imageUrl = product.getImageUrl() != null ? product.getImageUrl().split(",")[0].trim() : "";
        
        CartItemResponse response = new CartItemResponse();
        response.setId(cart.getId());
        response.setProductId(product.getId());
        response.setProductName(product.getName());
        response.setProductPrice(product.getPrice());
        response.setProductImageUrl(imageUrl);
        response.setQuantity(cart.getQuantity());
        response.setSubtotal(subtotal);
        // Add seller name (business name)
        if (product.getSeller() != null) {
            response.setSellerName(product.getSeller().getBusinessName());
        }
        
        if (cart.getCreatedAt() != null) {
            response.setCreatedAt(cart.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }
        if (cart.getUpdatedAt() != null) {
            response.setUpdatedAt(cart.getUpdatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }
        
        return response;
    }
}
