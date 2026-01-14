package com.localhunts.backend.dto;

import com.localhunts.backend.model.Role;

public class SellerListResponse {
    private Long id;
    private String userName;
    private String phoneNumber;
    private String contactEmail;
    private String location;
    private String businessName;
    private String businessCategory;
    private String businessPanVat;
    private String businessLocation;
    private Boolean approved;
    private Role role;
    private String createdAt;
    private String businessRegistrationCertificate;
    private String panVatCertificate;

    public SellerListResponse() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getBusinessCategory() {
        return businessCategory;
    }

    public void setBusinessCategory(String businessCategory) {
        this.businessCategory = businessCategory;
    }

    public String getBusinessPanVat() {
        return businessPanVat;
    }

    public void setBusinessPanVat(String businessPanVat) {
        this.businessPanVat = businessPanVat;
    }

    public String getBusinessLocation() {
        return businessLocation;
    }

    public void setBusinessLocation(String businessLocation) {
        this.businessLocation = businessLocation;
    }

    public Boolean getApproved() {
        return approved;
    }

    public void setApproved(Boolean approved) {
        this.approved = approved;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getBusinessRegistrationCertificate() {
        return businessRegistrationCertificate;
    }

    public void setBusinessRegistrationCertificate(String businessRegistrationCertificate) {
        this.businessRegistrationCertificate = businessRegistrationCertificate;
    }

    public String getPanVatCertificate() {
        return panVatCertificate;
    }

    public void setPanVatCertificate(String panVatCertificate) {
        this.panVatCertificate = panVatCertificate;
    }
}
