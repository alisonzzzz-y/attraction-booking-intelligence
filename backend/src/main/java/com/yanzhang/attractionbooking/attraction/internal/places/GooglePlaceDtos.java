package com.yanzhang.attractionbooking.attraction.internal.places;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

final class GooglePlaceDtos {

    private GooglePlaceDtos() {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Place(
            String id,
            DisplayName displayName,
            String formattedAddress,
            Coordinates location,
            String googleMapsUri,
            String businessStatus,
            Double rating,
            Integer userRatingCount,
            List<Photo> photos) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record DisplayName(String text, String languageCode) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Coordinates(Double latitude, Double longitude) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Photo(
            String name,
            Integer widthPx,
            Integer heightPx,
            List<AuthorAttribution> authorAttributions) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record AuthorAttribution(String displayName, String uri, String photoUri) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record PhotoMedia(String photoUri) {}
}
