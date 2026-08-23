package com.yanzhang.attractionbooking.provider;

import java.util.Objects;
import java.util.Set;

public record AttractionRequest(
        String internalAttractionId,
        String displayName,
        OfferingType offeringType,
        Set<ExternalReference> externalReferences) {

    public AttractionRequest(
            String internalAttractionId,
            String displayName,
            Set<ExternalReference> externalReferences) {
        this(internalAttractionId, displayName, OfferingType.UNKNOWN, externalReferences);
    }

    public AttractionRequest {
        if (internalAttractionId == null || internalAttractionId.isBlank()) {
            throw new IllegalArgumentException("Internal attraction ID must not be blank");
        }
        if (displayName == null || displayName.isBlank()) {
            throw new IllegalArgumentException("Attraction display name must not be blank");
        }
        Objects.requireNonNull(offeringType, "Offering type must not be null");
        Objects.requireNonNull(externalReferences, "External references must not be null");
        externalReferences = Set.copyOf(externalReferences);
    }
}
