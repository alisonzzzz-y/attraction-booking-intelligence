package com.yanzhang.attractionbooking.aiexplanation.internal;

import com.yanzhang.attractionbooking.aiexplanation.BookingExplanationFact;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

record BookingExplanationFacts(
        String city,
        LocalDate stayStartDate,
        LocalDate stayEndDate,
        List<BookingExplanationFact> facts) {

    BookingExplanationFacts {
        if (city == null || city.isBlank()) {
            throw new IllegalArgumentException("City is required");
        }
        Objects.requireNonNull(stayStartDate, "Stay start date is required");
        Objects.requireNonNull(stayEndDate, "Stay end date is required");
        Objects.requireNonNull(facts, "Facts are required");
        facts = List.copyOf(facts);
        if (facts.isEmpty()) {
            throw new IllegalArgumentException("At least one booking fact is required");
        }
    }
}
