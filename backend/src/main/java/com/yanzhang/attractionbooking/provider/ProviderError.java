package com.yanzhang.attractionbooking.provider;

import java.util.Objects;
import java.util.Set;

public record ProviderError(
        Type type,
        String code,
        String message,
        Set<String> affectedAttractionIds) {

    public ProviderError {
        Objects.requireNonNull(type, "Provider error type must not be null");
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Provider error code must not be blank");
        }
        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException("Provider error message must not be blank");
        }
        Objects.requireNonNull(affectedAttractionIds, "Affected attraction IDs must not be null");
        affectedAttractionIds = Set.copyOf(affectedAttractionIds);
    }

    public enum Type {
        AUTHENTICATION,
        RATE_LIMIT,
        TIMEOUT,
        UPSTREAM_FAILURE,
        INVALID_RESPONSE,
        UNSUPPORTED_REQUEST,
        UNKNOWN
    }
}
