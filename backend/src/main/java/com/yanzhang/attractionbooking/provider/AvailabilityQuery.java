package com.yanzhang.attractionbooking.provider;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

public record AvailabilityQuery(
        String city,
        LocalDate startDate,
        LocalDate endDate,
        List<AttractionRequest> attractions) {

    public AvailabilityQuery {
        if (city == null || city.isBlank()) {
            throw new IllegalArgumentException("City must not be blank");
        }
        Objects.requireNonNull(startDate, "Start date must not be null");
        Objects.requireNonNull(endDate, "End date must not be null");
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("End date must not be before start date");
        }
        Objects.requireNonNull(attractions, "Attractions must not be null");
        if (attractions.isEmpty()) {
            throw new IllegalArgumentException("At least one attraction is required");
        }
        attractions = List.copyOf(attractions);
    }
}
