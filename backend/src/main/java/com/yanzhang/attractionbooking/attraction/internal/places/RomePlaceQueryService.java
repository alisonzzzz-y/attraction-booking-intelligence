package com.yanzhang.attractionbooking.attraction.internal.places;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
class RomePlaceQueryService {

    private static final List<VerifiedPlaceMapping> VERIFIED_PLACES = List.of(
            new VerifiedPlaceMapping("pantheon", "pantheon", "ChIJqUCGZ09gLxMRLM42IPpl0co"),
            new VerifiedPlaceMapping(
                    "borghese-gallery", "borghese-gallery", "ChIJq-bXVgRhLxMRv3vgOXaktBs"),
            new VerifiedPlaceMapping(
                    "colosseum-archaeological-park",
                    "colosseum",
                    "ChIJrRMgU7ZhLxMRxAOFkC7I8Sg"),
            new VerifiedPlaceMapping(
                    "colosseum-archaeological-park",
                    "roman-forum",
                    "ChIJ782pg7NhLxMR5n3swAdAkfo"),
            new VerifiedPlaceMapping(
                    "colosseum-archaeological-park",
                    "palatine-hill",
                    "ChIJowJff7VhLxMRLmHQKoSniFE"),
            new VerifiedPlaceMapping(
                    "vatican-museums-sistine-chapel",
                    "vatican-museums",
                    "ChIJKcGbg2NgLxMRthZkUqDs4M8"),
            new VerifiedPlaceMapping(
                    "vatican-museums-sistine-chapel",
                    "sistine-chapel",
                    "ChIJ268jxWVgLxMRIj61f4fIFqs"),
            new VerifiedPlaceMapping(
                    "baths-of-caracalla",
                    "baths-of-caracalla",
                    "ChIJ1YU-M85hLxMR3Jhb6gZAK2o"),
            new VerifiedPlaceMapping(
                    "capitoline-museums",
                    "capitoline-museums",
                    "ChIJ8-wGeU9gLxMR--zJtnpGod4"),
            new VerifiedPlaceMapping(
                    "st-peters-basilica",
                    "st-peters-basilica",
                    "ChIJWZsUt2FgLxMRg1KHzXfwS3I"),
            new VerifiedPlaceMapping(
                    "castel-sant-angelo",
                    "castel-sant-angelo",
                    "ChIJ0aTnEYeKJRMRiUF95xwRbDY"),
            new VerifiedPlaceMapping(
                    "domus-aurea", "domus-aurea", "ChIJp-3oaLdhLxMRS_bYIp1GB8w"),
            new VerifiedPlaceMapping(
                    "trevi-fountain",
                    "trevi-fountain",
                    "ChIJ1UCDJ1NgLxMRtrsCzOHxdvY"));

    private final Optional<GooglePlacesClient> client;
    private final Clock clock;

    @Autowired
    RomePlaceQueryService(Optional<GooglePlacesClient> client) {
        this(client, Clock.systemUTC());
    }

    RomePlaceQueryService(Optional<GooglePlacesClient> client, Clock clock) {
        this.client = client;
        this.clock = clock;
    }

    List<RomePlaceEvidence> fetchVerifiedPlaces() {
        GooglePlacesClient configuredClient = client.orElseThrow(() ->
                new ResponseStatusException(
                        HttpStatus.SERVICE_UNAVAILABLE,
                        "Google Places location evidence is not configured"));

        try {
            return VERIFIED_PLACES.stream()
                    .map(mapping -> fetch(configuredClient, mapping))
                    .toList();
        } catch (GooglePlacesClientException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Google Places could not provide location evidence",
                    exception);
        }
    }

    private RomePlaceEvidence fetch(
            GooglePlacesClient configuredClient, VerifiedPlaceMapping mapping) {
        GooglePlaceDtos.Place place = configuredClient.fetchPlace(mapping.placeId());
        validate(mapping, place);
        return new RomePlaceEvidence(
                mapping.attractionId(),
                mapping.componentId(),
                place.id(),
                place.displayName().text(),
                place.formattedAddress(),
                place.location().latitude(),
                place.location().longitude(),
                place.googleMapsUri(),
                place.businessStatus(),
                clock.instant());
    }

    private static void validate(VerifiedPlaceMapping mapping, GooglePlaceDtos.Place place) {
        if (!mapping.placeId().equals(place.id())
                || place.displayName() == null
                || place.displayName().text() == null
                || place.displayName().text().isBlank()
                || place.formattedAddress() == null
                || place.location() == null
                || place.location().latitude() == null
                || place.location().longitude() == null
                || place.location().latitude() < -90
                || place.location().latitude() > 90
                || place.location().longitude() < -180
                || place.location().longitude() > 180) {
            throw new GooglePlacesClientException(
                    "The Google Places response did not match a verified Rome mapping");
        }
    }

    private record VerifiedPlaceMapping(String attractionId, String componentId, String placeId) {}

    record RomePlaceEvidence(
            String attractionId,
            String componentId,
            String placeId,
            String name,
            String formattedAddress,
            double latitude,
            double longitude,
            String googleMapsUri,
            String businessStatus,
            Instant retrievedAt) {}
}
