package com.yanzhang.attractionbooking.provider.internal.viator;

import java.net.URI;
import java.util.Objects;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("providers.viator")
public record ViatorProperties(boolean enabled, URI baseUrl, String apiKey) {

    public ViatorProperties {
        Objects.requireNonNull(baseUrl, "Viator base URL must not be null");
        apiKey = apiKey == null ? "" : apiKey;
    }

    String requiredApiKey() {
        if (apiKey.isBlank()) {
            throw new IllegalStateException("VIATOR_API_KEY is required when the Viator adapter is enabled");
        }
        return apiKey;
    }
}
