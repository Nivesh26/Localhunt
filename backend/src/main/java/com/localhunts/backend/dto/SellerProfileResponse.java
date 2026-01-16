package com.localhunts.backend.dto;

import com.localhunts.backend.model.Role;

public class SellerProfileResponse {
    private Long sellerId;
    private String userName;
    private String phoneNumber;
    private String contactEmail;
    private String location;
    private String businessName;
    private String businessCategory;
    private String businessPanVat;
    private String businessLocation;
    private String storeDescription;
    private Boolean storeStatus;
    private Role role;

    public SellerProfileResponse() {
    }

    public SellerProfileResponse(Long sellerId, String userName, String phoneNumber, String contactEmail,
                                 String location, String businessName, String businessCategory,
                                 String businessPanVat, String businessLocation, String storeDescription, Role role) {
        this.sellerId = sellerId;
        this.userName = userName;
        this.phoneNumber = phoneNumber;
        this.contactEmail = contactEmail;
        this.location = location;
        this.businessName = businessName;
        this.businessCategory = businessCategory;
        this.businessPanVat = businessPanVat;
        this.businessLocation = businessLocation;
        this.storeDescription = storeDescription;
        this.role = role;
    }

    // Getters and Setters
    public Long getSellerId() {
        return sellerId;
    }

    public void setSellerId(Long sellerId) {
        this.sellerId = sellerId;
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

    public String getStoreDescription() {
        return storeDescription;
    }

    public void setStoreDescription(String storeDescription) {
        this.storeDescription = storeDescription;
    }

    public Boolean getStoreStatus() {
        return storeStatus;
    }

    public void setStoreStatus(Boolean storeStatus) {
        this.storeStatus = storeStatus;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
