package com.yanzhang.attractionbooking.provider;

public record ExternalReference(String system, String value) {

    public ExternalReference {
        if (system == null || system.isBlank()) {
            throw new IllegalArgumentException("External reference system must not be blank");
        }
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("External reference value must not be blank");
        }
    }
}
