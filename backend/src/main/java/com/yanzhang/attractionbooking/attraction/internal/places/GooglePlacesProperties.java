package com.yanzhang.attractionbooking.attraction.internal.places;

import java.net.URI;
import java.util.Objects;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("providers.google-places")
record GooglePlacesProperties(boolean enabled, URI baseUrl, String apiKey) {

    GooglePlacesProperties {
        Objects.requireNonNull(baseUrl, "Google Places base URL must not be null");
        apiKey = apiKey == null ? "" : apiKey;
    }

    String requiredApiKey() {
        if (apiKey.isBlank()) {
            throw new IllegalStateException(
                    "GOOGLE_PLACES_API_KEY is required when Google Places is enabled");
        }
        return apiKey;
    }
}
