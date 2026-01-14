package com.localhunts.backend.service;

import com.localhunts.backend.dto.AuthResponse;
import com.localhunts.backend.dto.SellerListResponse;
import com.localhunts.backend.dto.SellerLoginRequest;
import com.localhunts.backend.dto.SellerSignupRequest;
import com.localhunts.backend.model.Role;
import com.localhunts.backend.model.Seller;
import com.localhunts.backend.repository.SellerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SellerService {

    @Autowired
    private SellerRepository sellerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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
        
        if (seller.getCreatedAt() != null) {
            response.setCreatedAt(seller.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }
        
        return response;
    }
}
