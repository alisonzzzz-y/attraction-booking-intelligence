package com.yanzhang.attractionbooking.bookingpriority;

import java.time.Instant;
import java.util.Objects;

public record BookingPriorityAssessment(
        String attractionId,
        String attractionName,
        BookingPriority priority,
        BookingConfidence confidence,
        BookingTiming timing,
        String action,
        String explanation,
        OfficialBookingEvidence officialEvidence,
        String ruleVersion,
        Instant calculatedAt) {

    public BookingPriorityAssessment {
        if (attractionId == null || attractionId.isBlank()) {
            throw new IllegalArgumentException("Attraction ID is required");
        }
        if (attractionName == null || attractionName.isBlank()) {
            throw new IllegalArgumentException("Attraction name is required");
        }
        Objects.requireNonNull(priority, "Booking priority is required");
        Objects.requireNonNull(confidence, "Confidence is required");
        Objects.requireNonNull(timing, "Booking timing is required");
        if (action == null || action.isBlank()) {
            throw new IllegalArgumentException("An action is required");
        }
        if (explanation == null || explanation.isBlank()) {
            throw new IllegalArgumentException("An explanation is required");
        }
        Objects.requireNonNull(officialEvidence, "Official evidence is required");
        if (!attractionId.equals(officialEvidence.attractionId())) {
            throw new IllegalArgumentException("Assessment and evidence attraction IDs must match");
        }
        if (ruleVersion == null || ruleVersion.isBlank()) {
            throw new IllegalArgumentException("A rule version is required");
        }
        Objects.requireNonNull(calculatedAt, "Calculation time is required");
    }
}
