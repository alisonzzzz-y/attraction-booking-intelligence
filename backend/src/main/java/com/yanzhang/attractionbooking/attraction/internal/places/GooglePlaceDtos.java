package com.yanzhang.attractionbooking.attraction.internal.places;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

final class GooglePlaceDtos {

    private GooglePlaceDtos() {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Place(
            String id,
            DisplayName displayName,
            String formattedAddress,
            Coordinates location,
            String googleMapsUri,
            String businessStatus) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record DisplayName(String text, String languageCode) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Coordinates(Double latitude, Double longitude) {}
}
