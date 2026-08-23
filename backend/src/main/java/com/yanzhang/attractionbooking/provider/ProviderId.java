package com.yanzhang.attractionbooking.provider;

public record ProviderId(String value) {

    public ProviderId {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Provider ID must not be blank");
        }
    }
}
