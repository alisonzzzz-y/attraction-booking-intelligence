package com.yanzhang.attractionbooking.attraction.internal.places;

import java.net.URI;
import java.time.Instant;
import java.util.List;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

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

    @GetMapping("/{placeId}/photos/{photoReference}")
    ResponseEntity<Void> photo(
            @PathVariable String placeId,
            @PathVariable String photoReference,
            @RequestParam(defaultValue = "960") int maxWidth) {
        if (maxWidth < 1 || maxWidth > 4800) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Photo width must be between 1 and 4800");
        }
        URI mediaUri = queryService.resolvePhotoMediaUri(placeId, photoReference, maxWidth);
        return ResponseEntity.status(HttpStatus.FOUND)
                .cacheControl(CacheControl.noStore())
                .location(mediaUri)
                .build();
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
            List<PlacePhotoView> photos,
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
                    evidence.photos().stream().map(PlacePhotoView::from).toList(),
                    evidence.retrievedAt());
        }
    }

    record LocationView(double latitude, double longitude) {}

    record PlacePhotoView(
            String reference,
            Integer widthPx,
            Integer heightPx,
            List<PhotoAttributionView> authorAttributions) {

        static PlacePhotoView from(RomePlaceQueryService.PlacePhoto photo) {
            return new PlacePhotoView(
                    photo.reference(),
                    photo.widthPx(),
                    photo.heightPx(),
                    photo.authorAttributions().stream().map(PhotoAttributionView::from).toList());
        }
    }

    record PhotoAttributionView(String displayName, String uri, String photoUri) {

        static PhotoAttributionView from(RomePlaceQueryService.PhotoAttribution attribution) {
            return new PhotoAttributionView(
                    attribution.displayName(), attribution.uri(), attribution.photoUri());
        }
    }
}
