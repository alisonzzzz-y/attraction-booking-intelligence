package com.yanzhang.attractionbooking.aiexplanation;

import java.time.LocalDate;
import java.util.Objects;

/** A source-traceable fact shown beside an AI explanation. */
public record BookingExplanationFact(
        String attractionId,
        String attractionName,
        String priority,
        String timing,
        String officialPolicy,
        String factualBasis,
        String action,
        String ruleVersion,
        LocalDate checkedOn) {

    public BookingExplanationFact {
        if (attractionId == null || attractionId.isBlank()) {
            throw new IllegalArgumentException("Attraction ID is required");
        }
        if (attractionName == null || attractionName.isBlank()) {
            throw new IllegalArgumentException("Attraction name is required");
        }
        if (priority == null || priority.isBlank()) {
            throw new IllegalArgumentException("Priority is required");
        }
        if (timing == null || timing.isBlank()) {
            throw new IllegalArgumentException("Timing is required");
        }
        if (officialPolicy == null || officialPolicy.isBlank()) {
            throw new IllegalArgumentException("Official policy is required");
        }
        if (factualBasis == null || factualBasis.isBlank()) {
            throw new IllegalArgumentException("Factual basis is required");
        }
        if (action == null || action.isBlank()) {
            throw new IllegalArgumentException("Action is required");
        }
        if (ruleVersion == null || ruleVersion.isBlank()) {
            throw new IllegalArgumentException("Rule version is required");
        }
        Objects.requireNonNull(checkedOn, "Checked-on date is required");
    }
}
