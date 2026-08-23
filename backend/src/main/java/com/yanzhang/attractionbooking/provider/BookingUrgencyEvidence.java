package com.yanzhang.attractionbooking.provider;

import java.time.Duration;
import java.util.Objects;
import java.util.Optional;

public record BookingUrgencyEvidence(
        ReservationRequirement reservationRequirement,
        Optional<Duration> bookingCutoff,
        Optional<Integer> salesWindowDays,
        SourceMetadata source) {

    public BookingUrgencyEvidence {
        Objects.requireNonNull(reservationRequirement, "Reservation requirement must not be null");
        Objects.requireNonNull(bookingCutoff, "Booking cutoff must not be null");
        bookingCutoff.ifPresent(value -> {
            if (value.isNegative()) {
                throw new IllegalArgumentException("Booking cutoff must not be negative");
            }
        });
        Objects.requireNonNull(salesWindowDays, "Sales window must not be null");
        salesWindowDays.ifPresent(value -> {
            if (value < 0) {
                throw new IllegalArgumentException("Sales window days must not be negative");
            }
        });
        Objects.requireNonNull(source, "Booking evidence source must not be null");
    }

    public enum ReservationRequirement {
        REQUIRED,
        RECOMMENDED,
        NOT_REQUIRED,
        UNKNOWN
    }
}
