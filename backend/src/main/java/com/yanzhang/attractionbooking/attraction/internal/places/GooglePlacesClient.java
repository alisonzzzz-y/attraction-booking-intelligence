package com.yanzhang.attractionbooking.attraction.internal.places;

import java.net.SocketTimeoutException;
import java.util.Objects;
import java.util.regex.Pattern;
import org.springframework.http.HttpHeaders;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

final class GooglePlacesClient {

    private static final Pattern PLACE_ID = Pattern.compile("[A-Za-z0-9_-]+");
    private static final String FIELD_MASK =
            "id,displayName,formattedAddress,location,googleMapsUri,businessStatus,rating,userRatingCount";

    private final RestClient restClient;

    GooglePlacesClient(RestClient.Builder builder, GooglePlacesProperties properties) {
        Objects.requireNonNull(builder, "RestClient builder must not be null");
        Objects.requireNonNull(properties, "Google Places properties must not be null");
        this.restClient = builder.baseUrl(properties.baseUrl().toString())
                .defaultHeader("X-Goog-Api-Key", properties.requiredApiKey())
                .defaultHeader(HttpHeaders.ACCEPT, "application/json")
                .build();
    }

    GooglePlaceDtos.Place fetchPlace(String placeId) {
        if (placeId == null || !PLACE_ID.matcher(placeId).matches()) {
            throw new GooglePlacesClientException("The Google Place ID is invalid");
        }

        try {
            GooglePlaceDtos.Place response = restClient
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .pathSegment("v1", "places", placeId)
                            .queryParam("languageCode", "en")
                            .queryParam("regionCode", "IT")
                            .build())
                    .header("X-Goog-FieldMask", FIELD_MASK)
                    .retrieve()
                    .body(GooglePlaceDtos.Place.class);
            if (response == null) {
                throw new GooglePlacesClientException("Google Places returned an empty response");
            }
            return response;
        } catch (RestClientResponseException exception) {
            throw new GooglePlacesClientException(
                    "Google Places returned HTTP " + exception.getStatusCode().value());
        } catch (ResourceAccessException exception) {
            if (exception.getCause() instanceof SocketTimeoutException) {
                throw new GooglePlacesClientException("The Google Places request timed out");
            }
            throw new GooglePlacesClientException("Google Places could not be reached");
        } catch (RestClientException exception) {
            throw new GooglePlacesClientException("The Google Places response could not be read");
        }
    }

}
