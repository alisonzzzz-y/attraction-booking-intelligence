package com.yanzhang.attractionbooking.aiexplanation.internal;

import java.net.URI;
import java.time.Duration;
import java.util.Objects;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("ai-explanation")
record AiExplanationProperties(
        boolean enabled,
        URI baseUrl,
        String apiKey,
        String model,
        Duration responseTimeout) {

    AiExplanationProperties {
        Objects.requireNonNull(baseUrl, "AI explanation base URL must not be null");
        apiKey = apiKey == null ? "" : apiKey;
        if (model == null || model.isBlank()) {
            throw new IllegalArgumentException("AI explanation model is required");
        }
        if (responseTimeout == null || responseTimeout.isZero() || responseTimeout.isNegative()) {
            throw new IllegalArgumentException("AI explanation response timeout must be positive");
        }
    }

    String requiredApiKey() {
        if (apiKey.isBlank()) {
            throw new IllegalStateException("OPENAI_API_KEY is required when AI explanations are enabled");
        }
        return apiKey;
    }
}
