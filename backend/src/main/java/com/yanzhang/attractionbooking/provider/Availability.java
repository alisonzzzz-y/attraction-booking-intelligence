package com.yanzhang.attractionbooking.provider;

import java.time.LocalDate;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

public record Availability(
        Status status,
        Set<LocalDate> explicitlyUnavailableDates,
        Optional<String> productCode,
        Optional<String> optionCode,
        Optional<String> reasonCode,
        SourceMetadata source) {

    public Availability {
        Objects.requireNonNull(status, "Availability status must not be null");
        Objects.requireNonNull(explicitlyUnavailableDates, "Unavailable dates must not be null");
        explicitlyUnavailableDates = Set.copyOf(explicitlyUnavailableDates);
        Objects.requireNonNull(productCode, "Product code must not be null");
        Objects.requireNonNull(optionCode, "Option code must not be null");
        Objects.requireNonNull(reasonCode, "Reason code must not be null");
        Objects.requireNonNull(source, "Availability source must not be null");
    }

    public enum Status {
        SCHEDULED,
        UNAVAILABLE,
        UNKNOWN,
        REQUEST_FAILED
    }
}
