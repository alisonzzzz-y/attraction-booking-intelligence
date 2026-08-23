package com.yanzhang.attractionbooking.provider;

import java.util.Objects;
import java.util.Optional;

public record Location(double latitude, double longitude, Optional<String> formattedAddress) {

    public Location {
        if (latitude < -90 || latitude > 90) {
            throw new IllegalArgumentException("Latitude must be between -90 and 90");
        }
        if (longitude < -180 || longitude > 180) {
            throw new IllegalArgumentException("Longitude must be between -180 and 180");
        }
        Objects.requireNonNull(formattedAddress, "Formatted address must not be null");
    }
}
