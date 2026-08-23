package com.yanzhang.attractionbooking.attraction.internal.places;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

class GooglePlacesClientContractTests {

    private static final String PLACE_ID = "ChIJqUCGZ09gLxMRLM42IPpl0co";
    private static final String TEST_API_KEY = "places-test-secret";

    private final AtomicReference<String> receivedApiKey = new AtomicReference<>();
    private final AtomicReference<String> receivedFieldMask = new AtomicReference<>();
    private HttpServer server;
    private GooglePlacesClient client;
    private int responseStatus;
    private String responseBody;

    @BeforeEach
    void startServer() throws IOException {
        responseStatus = 200;
        responseBody = placeJson();
        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/v1/places/" + PLACE_ID, this::handlePlace);
        server.start();

        URI baseUrl = URI.create("http://localhost:" + server.getAddress().getPort());
        GooglePlacesProperties properties =
                new GooglePlacesProperties(true, baseUrl, TEST_API_KEY);
        client = new GooglePlacesClient(RestClient.builder(), properties);
    }

    @AfterEach
    void stopServer() {
        server.stop(0);
    }

    @Test
    void sendsARestrictedFieldMaskAndMapsTheVerifiedPlace() {
        GooglePlaceDtos.Place place = client.fetchPlace(PLACE_ID);

        assertEquals(TEST_API_KEY, receivedApiKey.get());
        assertEquals(
                "id,displayName,formattedAddress,location,googleMapsUri,businessStatus",
                receivedFieldMask.get());
        assertEquals(PLACE_ID, place.id());
        assertEquals("Pantheon", place.displayName().text());
        assertEquals(41.8986108, place.location().latitude());
        assertEquals(12.4768729, place.location().longitude());
    }

    @Test
    void doesNotExposeTheApiKeyWhenGoogleRejectsTheRequest() {
        responseStatus = 403;
        responseBody = "{\"error\":\"forbidden\"}";

        GooglePlacesClientException exception = assertThrows(
                GooglePlacesClientException.class, () -> client.fetchPlace(PLACE_ID));

        assertFalse(exception.getMessage().contains(TEST_API_KEY));
        assertEquals("Google Places returned HTTP 403", exception.getMessage());
    }

    private void handlePlace(HttpExchange exchange) throws IOException {
        receivedApiKey.set(exchange.getRequestHeaders().getFirst("X-Goog-Api-Key"));
        receivedFieldMask.set(exchange.getRequestHeaders().getFirst("X-Goog-FieldMask"));
        byte[] body = responseBody.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(responseStatus, body.length);
        exchange.getResponseBody().write(body);
        exchange.close();
    }

    private static String placeJson() {
        return """
                {
                  "id": "ChIJqUCGZ09gLxMRLM42IPpl0co",
                  "displayName": {"text": "Pantheon", "languageCode": "en"},
                  "formattedAddress": "Piazza della Rotonda, 00186 Roma RM, Italy",
                  "location": {"latitude": 41.8986108, "longitude": 12.4768729},
                  "googleMapsUri": "https://maps.google.com/?cid=123",
                  "businessStatus": "OPERATIONAL"
                }
                """;
    }
}
