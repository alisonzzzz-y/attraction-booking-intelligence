package com.yanzhang.attractionbooking.bookingpriority;

import java.net.URI;
import java.time.LocalDate;
import java.util.Objects;

public record OfficialBookingEvidence(
        String attractionId,
        String attractionName,
        OfficialBookingPolicy policy,
        String factualBasis,
        OfficialAttractionDetails details,
        URI sourceUrl,
        URI bookingUrl,
        LocalDate checkedOn) {

    public OfficialBookingEvidence {
        if (attractionId == null || attractionId.isBlank()) {
            throw new IllegalArgumentException("Attraction ID is required");
        }
        if (attractionName == null || attractionName.isBlank()) {
            throw new IllegalArgumentException("Attraction name is required");
        }
        Objects.requireNonNull(policy, "Official booking policy is required");
        if (factualBasis == null || factualBasis.isBlank()) {
            throw new IllegalArgumentException("A factual basis is required");
        }
        Objects.requireNonNull(details, "Official attraction details are required");
        Objects.requireNonNull(sourceUrl, "Official source URL is required");
        Objects.requireNonNull(bookingUrl, "Official booking URL is required");
        Objects.requireNonNull(checkedOn, "Evidence check date is required");
    }
}
