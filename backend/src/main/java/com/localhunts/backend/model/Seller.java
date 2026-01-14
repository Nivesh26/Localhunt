package com.localhunts.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "sellers")
public class Seller {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false)
    private String userName;

    @NotBlank
    @Size(max = 10)
    @Column(nullable = false)
    private String phoneNumber;

    @NotBlank
    @Email
    @Size(max = 100)
    @Column(nullable = false, unique = true)
    private String contactEmail;

    @NotBlank
    @Size(max = 200)
    @Column(nullable = false)
    private String location;

    @NotBlank
    @Size(max = 200)
    @Column(nullable = false)
    private String businessName;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false)
    private String businessCategory;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false)
    private String businessPanVat;

    @NotBlank
    @Size(max = 200)
    @Column(nullable = false)
    private String businessLocation;

    @NotBlank
    @Size(min = 6)
    @Column(nullable = false)
    private String password;

    @Column(length = 500)
    private String businessRegistrationCertificate;

    @Column(length = 500)
    private String panVatCertificate;

    @Column(nullable = false)
    private Boolean approved = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.VENDOR;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Seller() {
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
