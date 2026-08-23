package com.yanzhang.attractionbooking.provider;

import java.util.List;
import java.util.Objects;

public record AttractionResult(
        Attraction attraction,
        OpeningHours openingHours,
        BookingUrgencyEvidence bookingUrgencyEvidence,
        Availability availability,
        List<Price> prices) {

    public AttractionResult {
        Objects.requireNonNull(attraction, "Attraction must not be null");
        Objects.requireNonNull(openingHours, "Opening hours must not be null");
        Objects.requireNonNull(bookingUrgencyEvidence, "Booking urgency evidence must not be null");
        Objects.requireNonNull(availability, "Availability must not be null");
        Objects.requireNonNull(prices, "Prices must not be null");
        prices = List.copyOf(prices);
    }
}
