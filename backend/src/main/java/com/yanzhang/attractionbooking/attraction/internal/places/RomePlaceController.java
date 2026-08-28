package com.yanzhang.attractionbooking.attraction.internal.places;

import java.time.Instant;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/rome/places")
class RomePlaceController {

    private final RomePlaceQueryService queryService;

    RomePlaceController(RomePlaceQueryService queryService) {
        this.queryService = queryService;
    }

    @GetMapping
    RomePlacesResponse search() {
        return RomePlacesResponse.from(queryService.fetchVerifiedPlaces());
    }

    record RomePlacesResponse(String city, String source, List<PlaceView> attractions) {

        static RomePlacesResponse from(List<RomePlaceQueryService.RomePlaceEvidence> evidence) {
            return new RomePlacesResponse(
                    "Rome", "google-places", evidence.stream().map(PlaceView::from).toList());
        }
    }

    record PlaceView(
            String attractionId,
            String componentId,
            String placeId,
            String name,
            String formattedAddress,
            LocationView location,
            String googleMapsUri,
            String businessStatus,
            Double rating,
            Integer userRatingCount,
            Instant retrievedAt) {

        static PlaceView from(RomePlaceQueryService.RomePlaceEvidence evidence) {
            return new PlaceView(
                    evidence.attractionId(),
                    evidence.componentId(),
                    evidence.placeId(),
                    evidence.name(),
                    evidence.formattedAddress(),
                    new LocationView(evidence.latitude(), evidence.longitude()),
                    evidence.googleMapsUri(),
                    evidence.businessStatus(),
                    evidence.rating(),
                    evidence.userRatingCount(),
                    evidence.retrievedAt());
        }
    }

    record LocationView(double latitude, double longitude) {}

}
