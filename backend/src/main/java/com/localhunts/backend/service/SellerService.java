package com.localhunts.backend.service;

import com.localhunts.backend.dto.AuthResponse;
import com.localhunts.backend.dto.ChangePasswordRequest;
import com.localhunts.backend.dto.SellerListResponse;
import com.localhunts.backend.dto.SellerLoginRequest;
import com.localhunts.backend.dto.SellerProfileResponse;
import com.localhunts.backend.dto.SellerSignupRequest;
import com.localhunts.backend.dto.UpdateSellerSettingsRequest;
import com.localhunts.backend.model.Product;
import com.localhunts.backend.model.Role;
import com.localhunts.backend.model.Seller;
import com.localhunts.backend.repository.CartRepository;
import com.localhunts.backend.repository.ProductRepository;
import com.localhunts.backend.repository.SellerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SellerService {

    @Autowired
    private SellerRepository sellerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartRepository cartRepository;

    public AuthResponse signup(SellerSignupRequest signupRequest) {
        // Check if passwords match
        if (!signupRequest.getPassword().equals(signupRequest.getConfirmPassword())) {
            return new AuthResponse("Passwords do not match", false);
        }

        // Check if seller already exists
        if (sellerRepository.existsByContactEmail(signupRequest.getContactEmail())) {
            return new AuthResponse("Email already exists", false);
        }

        // Create new seller
        Seller seller = new Seller();
        seller.setUserName(signupRequest.getUserName());
        seller.setPhoneNumber(signupRequest.getPhoneNumber());
        seller.setContactEmail(signupRequest.getContactEmail());
        seller.setLocation(signupRequest.getLocation());
        seller.setBusinessName(signupRequest.getBusinessName());
        seller.setBusinessCategory(signupRequest.getBusinessCategory());
        seller.setBusinessPanVat(signupRequest.getBusinessPanVat());
        seller.setBusinessLocation(signupRequest.getBusinessLocation());
        seller.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        seller.setRole(Role.VENDOR);
        seller.setApproved(false); // Needs admin approval
        seller.setBusinessRegistrationCertificate(signupRequest.getBusinessRegistrationCertificate());
        seller.setPanVatCertificate(signupRequest.getPanVatCertificate());

        Seller savedSeller = sellerRepository.save(seller);

        return new AuthResponse(
            "Seller registration submitted successfully. Waiting for admin approval.",
            savedSeller.getId(),
            savedSeller.getContactEmail(),
            savedSeller.getUserName(),
            savedSeller.getRole(),
            true
        );
    }

    public AuthResponse login(SellerLoginRequest loginRequest) {
        // Find seller by email
        Seller seller = sellerRepository.findByContactEmail(loginRequest.getEmail())
            .orElse(null);

        if (seller == null) {
            return new AuthResponse("Invalid email or password", false);
        }

        // Check password
        if (!passwordEncoder.matches(loginRequest.getPassword(), seller.getPassword())) {
            return new AuthResponse("Invalid email or password", false);
        }

        // Check if seller is approved
        if (!seller.getApproved()) {
            return new AuthResponse("Your account is pending approval. Please wait for admin approval.", false);
        }

        return new AuthResponse(
            "Login successful",
            seller.getId(),
            seller.getContactEmail(),
            seller.getUserName(),
            seller.getRole(),
            true
        );
    }

    public List<SellerListResponse> getPendingSellers() {
        List<Seller> sellers = sellerRepository.findByApprovedFalse();
        return sellers.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    public List<SellerListResponse> getApprovedSellers() {
        List<Seller> sellers = sellerRepository.findByApprovedTrue();
        return sellers.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    public SellerListResponse approveSeller(Long sellerId) {
        Seller seller = sellerRepository.findById(sellerId)
            .orElseThrow(() -> new RuntimeException("Seller not found"));
        
        seller.setApproved(true);
        Seller updatedSeller = sellerRepository.save(seller);
        
        return convertToResponse(updatedSeller);
    }

    public void rejectSeller(Long sellerId) {
        Seller seller = sellerRepository.findById(sellerId)
            .orElseThrow(() -> new RuntimeException("Seller not found"));
        
        sellerRepository.delete(seller);
    }

    public SellerProfileResponse getSellerProfile(Long sellerId) {
        Seller seller = sellerRepository.findById(sellerId)
            .orElseThrow(() -> new RuntimeException("Seller not found"));
        
        return new SellerProfileResponse(
            seller.getId(),
            seller.getUserName(),
            seller.getPhoneNumber(),
            seller.getContactEmail(),
            seller.getLocation(),
            seller.getBusinessName(),
            seller.getBusinessCategory(),
            seller.getBusinessPanVat(),
            seller.getBusinessLocation(),
            seller.getStoreDescription() != null ? seller.getStoreDescription() : "",
            seller.getRole()
        );
    }

    public SellerProfileResponse updateSellerSettings(Long sellerId, UpdateSellerSettingsRequest request) {
        Seller seller = sellerRepository.findById(sellerId)
            .orElseThrow(() -> new RuntimeException("Seller not found"));

        // Check if email is being changed and if new email already exists (for a different seller)
        if (!seller.getContactEmail().equals(request.getContactEmail()) && 
            sellerRepository.existsByContactEmail(request.getContactEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Update seller fields
        seller.setUserName(request.getUserName());
        seller.setPhoneNumber(request.getPhoneNumber());
        seller.setContactEmail(request.getContactEmail());
        seller.setLocation(request.getLocation());
        seller.setBusinessName(request.getBusinessName());
        seller.setBusinessCategory(request.getBusinessCategory());
        seller.setBusinessPanVat(request.getBusinessPanVat());
        seller.setBusinessLocation(request.getBusinessLocation());
        seller.setStoreDescription(request.getStoreDescription() != null ? request.getStoreDescription() : "");

        Seller updatedSeller = sellerRepository.save(seller);
        
        return new SellerProfileResponse(
            updatedSeller.getId(),
            updatedSeller.getUserName(),
            updatedSeller.getPhoneNumber(),
            updatedSeller.getContactEmail(),
            updatedSeller.getLocation(),
            updatedSeller.getBusinessName(),
            updatedSeller.getBusinessCategory(),
            updatedSeller.getBusinessPanVat(),
            updatedSeller.getBusinessLocation(),
            updatedSeller.getStoreDescription() != null ? updatedSeller.getStoreDescription() : "",
            updatedSeller.getRole()
        );
    }

    public AuthResponse changePassword(Long sellerId, ChangePasswordRequest request) {
        // Find seller
        Seller seller = sellerRepository.findById(sellerId)
            .orElseThrow(() -> new RuntimeException("Seller not found"));

        // Verify old password
        if (!passwordEncoder.matches(request.getOldPassword(), seller.getPassword())) {
            return new AuthResponse("Old password is incorrect", false);
        }

        // Check if new password and confirm password match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return new AuthResponse("New password and confirm password do not match", false);
        }

        // Check if new password is different from old password
        if (passwordEncoder.matches(request.getNewPassword(), seller.getPassword())) {
            return new AuthResponse("New password must be different from old password", false);
        }

        // Update password
        seller.setPassword(passwordEncoder.encode(request.getNewPassword()));
        sellerRepository.save(seller);

        return new AuthResponse("Password changed successfully", true);
    }

    @Transactional
    public void deleteSeller(Long sellerId) {
        Seller seller = sellerRepository.findById(sellerId)
            .orElseThrow(() -> new RuntimeException("Seller not found"));
        
        // Find all products by this seller
        List<Product> products = productRepository.findBySeller(seller);
        
        // Delete all cart items that reference these products
        for (Product product : products) {
            cartRepository.deleteByProduct(product);
        }
        
        // Delete all products
        productRepository.deleteAll(products);
        
        // Delete the seller
        sellerRepository.delete(seller);
    }

    private SellerListResponse convertToResponse(Seller seller) {
        SellerListResponse response = new SellerListResponse();
        response.setId(seller.getId());
        response.setUserName(seller.getUserName());
        response.setPhoneNumber(seller.getPhoneNumber());
        response.setContactEmail(seller.getContactEmail());
        response.setLocation(seller.getLocation());
        response.setBusinessName(seller.getBusinessName());
        response.setBusinessCategory(seller.getBusinessCategory());
        response.setBusinessPanVat(seller.getBusinessPanVat());
        response.setBusinessLocation(seller.getBusinessLocation());
        response.setApproved(seller.getApproved());
        response.setRole(seller.getRole());
        response.setBusinessRegistrationCertificate(seller.getBusinessRegistrationCertificate());
        response.setPanVatCertificate(seller.getPanVatCertificate());
        
        if (seller.getCreatedAt() != null) {
            response.setCreatedAt(seller.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }
        
        return response;
    }
}
