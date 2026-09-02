package com.yanzhang.attractionbooking.provider.internal.viator;

import java.net.URI;
import java.time.Duration;
import java.util.Objects;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("providers.viator")
public record ViatorProperties(
        boolean enabled,
        URI baseUrl,
        String apiKey,
        Duration connectTimeout,
        Duration readTimeout,
        int maxRetries) {

    ViatorProperties(boolean enabled, URI baseUrl, String apiKey) {
        this(enabled, baseUrl, apiKey, Duration.ofSeconds(3), Duration.ofSeconds(8), 1);
    }

    public ViatorProperties {
        Objects.requireNonNull(baseUrl, "Viator base URL must not be null");
        apiKey = apiKey == null ? "" : apiKey;
        connectTimeout = positiveTimeout(connectTimeout, "Viator connect timeout");
        readTimeout = positiveTimeout(readTimeout, "Viator read timeout");
        if (maxRetries < 0 || maxRetries > 2) {
            throw new IllegalArgumentException("Viator max retries must be between 0 and 2");
        }
    }

    String requiredApiKey() {
        if (apiKey.isBlank()) {
            throw new IllegalStateException("VIATOR_API_KEY is required when the Viator adapter is enabled");
        }
        return apiKey;
    }

    private static Duration positiveTimeout(Duration value, String label) {
        if (value == null || value.isZero() || value.isNegative()) {
            throw new IllegalArgumentException(label + " must be positive");
        }
        return value;
    }
}
