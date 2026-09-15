package com.yanzhang.attractionbooking.attraction.internal.places;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

public final class GooglePlaceDtos {

    private GooglePlaceDtos() {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Place(
            String id,
            DisplayName displayName,
            String formattedAddress,
            Coordinates location,
            String googleMapsUri,
            String businessStatus,
            Double rating,
            Integer userRatingCount) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record DisplayName(String text, String languageCode) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Coordinates(Double latitude, Double longitude) {}

}
