package com.yanzhang.attractionbooking.provider;

import java.util.Objects;
import java.util.Optional;
import java.util.Set;

public record Attraction(
        String internalAttractionId,
        String displayName,
        OfferingType offeringType,
        Optional<Location> location,
        Set<ExternalReference> externalReferences,
        SourceMetadata source) {

    public Attraction(
            String internalAttractionId,
            String displayName,
            Optional<Location> location,
            Set<ExternalReference> externalReferences,
            SourceMetadata source) {
        this(
                internalAttractionId,
                displayName,
                OfferingType.UNKNOWN,
                location,
                externalReferences,
                source);
    }

    public Attraction {
        if (internalAttractionId == null || internalAttractionId.isBlank()) {
            throw new IllegalArgumentException("Internal attraction ID must not be blank");
        }
        if (displayName == null || displayName.isBlank()) {
            throw new IllegalArgumentException("Attraction display name must not be blank");
        }
        Objects.requireNonNull(offeringType, "Offering type must not be null");
        Objects.requireNonNull(location, "Location must not be null");
        Objects.requireNonNull(externalReferences, "External references must not be null");
        externalReferences = Set.copyOf(externalReferences);
        Objects.requireNonNull(source, "Attraction source must not be null");
    }
}
