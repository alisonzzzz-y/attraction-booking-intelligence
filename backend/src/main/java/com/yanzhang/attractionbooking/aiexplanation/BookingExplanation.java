package com.yanzhang.attractionbooking.aiexplanation;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

/** A natural-language explanation layered on top of deterministic booking-priority facts. */
public record BookingExplanation(
        String city,
        LocalDate stayStartDate,
        LocalDate stayEndDate,
        Mode mode,
        String summary,
        List<BookingExplanationFact> facts,
        String boundaryNotice) {

    public BookingExplanation {
        if (city == null || city.isBlank()) {
            throw new IllegalArgumentException("City is required");
        }
        Objects.requireNonNull(stayStartDate, "Stay start date is required");
        Objects.requireNonNull(stayEndDate, "Stay end date is required");
        Objects.requireNonNull(mode, "Explanation mode is required");
        if (summary == null || summary.isBlank()) {
            throw new IllegalArgumentException("Explanation summary is required");
        }
        Objects.requireNonNull(facts, "Explanation facts are required");
        facts = List.copyOf(facts);
        if (boundaryNotice == null || boundaryNotice.isBlank()) {
            throw new IllegalArgumentException("Boundary notice is required");
        }
    }

    public enum Mode {
        MODEL,
        TEMPLATE_FALLBACK
    }
}
