package com.localhunts.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateSellerSettingsRequest {
    @NotBlank(message = "User name is required")
    @Size(min = 2, max = 100, message = "User name must be between 2 and 100 characters")
    private String userName;

    @NotBlank(message = "Phone number is required")
    @Size(max = 10, message = "Phone number must be 10 digits")
    private String phoneNumber;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String contactEmail;

    @NotBlank(message = "Location is required")
    @Size(max = 200, message = "Location must not exceed 200 characters")
    private String location;

    @NotBlank(message = "Business name is required")
    @Size(max = 200, message = "Business name must not exceed 200 characters")
    private String businessName;

    @NotBlank(message = "Business category is required")
    @Size(max = 100, message = "Business category must not exceed 100 characters")
    private String businessCategory;

    @NotBlank(message = "PAN / VAT ID is required")
    @Size(max = 50, message = "PAN / VAT ID must not exceed 50 characters")
    private String businessPanVat;

    @NotBlank(message = "Business location is required")
    @Size(max = 200, message = "Business location must not exceed 200 characters")
    private String businessLocation;

    @Size(max = 2000, message = "Store description must not exceed 2000 characters")
    private String storeDescription;

    public UpdateSellerSettingsRequest() {
    }

    // Getters and Setters
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
}
