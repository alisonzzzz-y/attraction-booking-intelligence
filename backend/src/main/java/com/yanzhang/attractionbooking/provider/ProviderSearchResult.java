package com.yanzhang.attractionbooking.provider;

import java.util.List;
import java.util.Objects;

public record ProviderSearchResult(
        ProviderId providerId,
        ProviderEnvironment environment,
        List<AttractionResult> attractions,
        List<ProviderError> errors) {

    public ProviderSearchResult {
        Objects.requireNonNull(providerId, "Provider ID must not be null");
        Objects.requireNonNull(environment, "Provider environment must not be null");
        Objects.requireNonNull(attractions, "Attraction results must not be null");
        attractions = List.copyOf(attractions);
        Objects.requireNonNull(errors, "Provider errors must not be null");
        errors = List.copyOf(errors);
        if (attractions.isEmpty() && errors.isEmpty()) {
            throw new IllegalArgumentException("A provider result must contain data or an error");
        }
    }

    public boolean isPartialFailure() {
        return !attractions.isEmpty() && !errors.isEmpty();
    }

    public boolean isCompleteFailure() {
        return attractions.isEmpty() && !errors.isEmpty();
    }
}
