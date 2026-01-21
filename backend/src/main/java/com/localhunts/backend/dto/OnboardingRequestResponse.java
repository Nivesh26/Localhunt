package com.localhunts.backend.dto;

import java.time.LocalDateTime;

public class OnboardingRequestResponse {
    private Long id;
    private String businessName;
    private String ownerName;
    private String submittedAt;
    private String documents;
    private String status;

    public OnboardingRequestResponse() {
    }

    public OnboardingRequestResponse(Long id, String businessName, String ownerName, String submittedAt, String documents, String status) {
        this.id = id;
        this.businessName = businessName;
        this.ownerName = ownerName;
        this.submittedAt = submittedAt;
        this.documents = documents;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(String submittedAt) {
        this.submittedAt = submittedAt;
    }

    public String getDocuments() {
        return documents;
    }

    public void setDocuments(String documents) {
        this.documents = documents;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
