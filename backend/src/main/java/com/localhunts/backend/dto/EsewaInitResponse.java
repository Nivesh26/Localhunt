package com.localhunts.backend.dto;

import java.util.Map;

public class EsewaInitResponse {
    private String formActionUrl;
    private Map<String, String> formData;

    public EsewaInitResponse() {
    }

    public EsewaInitResponse(String formActionUrl, Map<String, String> formData) {
        this.formActionUrl = formActionUrl;
        this.formData = formData;
    }

    public String getFormActionUrl() {
        return formActionUrl;
    }

    public void setFormActionUrl(String formActionUrl) {
        this.formActionUrl = formActionUrl;
    }

    public Map<String, String> getFormData() {
        return formData;
    }

    public void setFormData(Map<String, String> formData) {
        this.formData = formData;
    }
}
