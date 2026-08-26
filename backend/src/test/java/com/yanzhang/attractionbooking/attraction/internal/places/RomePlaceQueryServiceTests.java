package com.yanzhang.attractionbooking.attraction.internal.places;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

class RomePlaceQueryServiceTests {

    @Test
    void reportsServiceUnavailableWhenGooglePlacesIsNotConfigured() {
        RomePlaceQueryService service = new RomePlaceQueryService(
                Optional.empty(), Clock.fixed(Instant.EPOCH, ZoneOffset.UTC));

        ResponseStatusException exception =
                assertThrows(ResponseStatusException.class, service::fetchVerifiedPlaces);

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, exception.getStatusCode());
    }

    @Test
    void fetchesSingleAndCompositeVerifiedRomeMappings() throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext(
                "/v1/places/ChIJqUCGZ09gLxMRLM42IPpl0co",
                exchange -> respond(exchange, pantheonJson()));
        server.createContext(
                "/v1/places/ChIJq-bXVgRhLxMRv3vgOXaktBs",
                exchange -> respond(exchange, borgheseGalleryJson()));
        server.createContext(
                "/v1/places/ChIJrRMgU7ZhLxMRxAOFkC7I8Sg",
                exchange -> respond(exchange, placeJson(
                        "ChIJrRMgU7ZhLxMRxAOFkC7I8Sg",
                        "Colosseum",
                        "Piazza del Colosseo, 1, 00184 Roma RM, Italy",
                        41.8902102,
                        12.4922309)));
        server.createContext(
                "/v1/places/ChIJ782pg7NhLxMR5n3swAdAkfo",
                exchange -> respond(exchange, placeJson(
                        "ChIJ782pg7NhLxMR5n3swAdAkfo",
                        "Roman Forum",
                        "Via della Salara Vecchia, 5/6, 00186 Roma RM, Italy",
                        41.8924623,
                        12.485325)));
        server.createContext(
                "/v1/places/ChIJowJff7VhLxMRLmHQKoSniFE",
                exchange -> respond(exchange, placeJson(
                        "ChIJowJff7VhLxMRLmHQKoSniFE",
                        "Palatine Hill",
                        "00186 Rome, Metropolitan City of Rome Capital, Italy",
                        41.889423,
                        12.487466)));
        server.createContext(
                "/v1/places/ChIJKcGbg2NgLxMRthZkUqDs4M8",
                exchange -> respond(exchange, placeJson(
                        "ChIJKcGbg2NgLxMRthZkUqDs4M8",
                        "Vatican Museums",
                        "00120, Vatican City",
                        41.9064878,
                        12.4536413)));
        server.createContext(
                "/v1/places/ChIJ268jxWVgLxMRIj61f4fIFqs",
                exchange -> respond(exchange, placeJson(
                        "ChIJ268jxWVgLxMRIj61f4fIFqs",
                        "Sistine Chapel",
                        "00120, Vatican City",
                        41.9029468,
                        12.4544835)));
        server.createContext(
                "/v1/places/ChIJ1YU-M85hLxMR3Jhb6gZAK2o",
                exchange -> respond(exchange, placeJson(
                        "ChIJ1YU-M85hLxMR3Jhb6gZAK2o",
                        "Baths of Caracalla",
                        "Viale delle Terme di Caracalla, 00153 Roma RM, Italy",
                        41.8790382,
                        12.4924394)));
        server.createContext(
                "/v1/places/ChIJ8-wGeU9gLxMR--zJtnpGod4",
                exchange -> respond(exchange, placeJson(
                        "ChIJ8-wGeU9gLxMR--zJtnpGod4",
                        "Capitoline Museums",
                        "Piazza del Campidoglio, 1, 00186 Roma RM, Italy",
                        41.8929428,
                        12.4825577)));
        server.createContext(
                "/v1/places/ChIJWZsUt2FgLxMRg1KHzXfwS3I",
                exchange -> respond(exchange, placeJson(
                        "ChIJWZsUt2FgLxMRg1KHzXfwS3I",
                        "Saint Peter's Basilica",
                        "Piazza San Pietro, 00120 Citta del Vaticano",
                        41.9021667,
                        12.4539367)));
        server.createContext(
                "/v1/places/ChIJ0aTnEYeKJRMRiUF95xwRbDY",
                exchange -> respond(exchange, placeJson(
                        "ChIJ0aTnEYeKJRMRiUF95xwRbDY",
                        "Castel Sant'Angelo",
                        "Lungotevere Castello, 50, 00193 Roma RM, Italy",
                        41.9030632,
                        12.466276)));
        server.createContext(
                "/v1/places/ChIJp-3oaLdhLxMRS_bYIp1GB8w",
                exchange -> respond(exchange, placeJson(
                        "ChIJp-3oaLdhLxMRS_bYIp1GB8w",
                        "Domus Aurea",
                        "Via della Domus Aurea, 1, 00184 Roma RM, Italy",
                        41.891076,
                        12.495715)));
        server.createContext(
                "/v1/places/ChIJ1UCDJ1NgLxMRtrsCzOHxdvY",
                exchange -> respond(exchange, placeJson(
                        "ChIJ1UCDJ1NgLxMRtrsCzOHxdvY",
                        "Trevi Fountain",
                        "Piazza di Trevi, 00187 Roma RM, Italy",
                        41.9009325,
                        12.483313)));
        server.start();

        try {
            URI baseUrl = URI.create("http://localhost:" + server.getAddress().getPort());
            GooglePlacesClient client = new GooglePlacesClient(
                    RestClient.builder(),
                    new GooglePlacesProperties(true, baseUrl, "places-test-secret"));
            RomePlaceQueryService service = new RomePlaceQueryService(
                    Optional.of(client),
                    Clock.fixed(Instant.parse("2026-08-19T08:01:00Z"), ZoneOffset.UTC));

            List<RomePlaceQueryService.RomePlaceEvidence> evidence =
                    service.fetchVerifiedPlaces();

            assertEquals(13, evidence.size());
            assertEquals("pantheon", evidence.get(0).attractionId());
            assertEquals("pantheon", evidence.get(0).componentId());
            assertEquals("ChIJqUCGZ09gLxMRLM42IPpl0co", evidence.get(0).placeId());
            assertEquals("borghese-gallery", evidence.get(1).attractionId());
            assertEquals("ChIJq-bXVgRhLxMRv3vgOXaktBs", evidence.get(1).placeId());
            assertEquals("Galleria Borghese", evidence.get(1).name());
            assertEquals("colosseum-archaeological-park", evidence.get(2).attractionId());
            assertEquals("colosseum", evidence.get(2).componentId());
            assertEquals("roman-forum", evidence.get(3).componentId());
            assertEquals("palatine-hill", evidence.get(4).componentId());
            assertEquals("vatican-museums-sistine-chapel", evidence.get(5).attractionId());
            assertEquals("vatican-museums", evidence.get(5).componentId());
            assertEquals("ChIJKcGbg2NgLxMRthZkUqDs4M8", evidence.get(5).placeId());
            assertEquals("vatican-museums-sistine-chapel", evidence.get(6).attractionId());
            assertEquals("sistine-chapel", evidence.get(6).componentId());
            assertEquals("ChIJ268jxWVgLxMRIj61f4fIFqs", evidence.get(6).placeId());
            assertEquals("baths-of-caracalla", evidence.get(7).attractionId());
            assertEquals("baths-of-caracalla", evidence.get(7).componentId());
            assertEquals("ChIJ1YU-M85hLxMR3Jhb6gZAK2o", evidence.get(7).placeId());
            assertEquals("capitoline-museums", evidence.get(8).attractionId());
            assertEquals("capitoline-museums", evidence.get(8).componentId());
            assertEquals("ChIJ8-wGeU9gLxMR--zJtnpGod4", evidence.get(8).placeId());
            assertEquals("st-peters-basilica", evidence.get(9).attractionId());
            assertEquals("castel-sant-angelo", evidence.get(10).attractionId());
            assertEquals("domus-aurea", evidence.get(11).attractionId());
            assertEquals("trevi-fountain", evidence.get(12).attractionId());
        } finally {
            server.stop(0);
        }
    }

    @Test
    void retainsSuccessfulMappingsWhenAnotherGooglePlaceFails() throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/v1/places", exchange -> {
            if (exchange.getRequestURI().getPath().endsWith("ChIJqUCGZ09gLxMRLM42IPpl0co")) {
                respond(exchange, pantheonJson());
                return;
            }
            respond(exchange, "{\"error\":\"unavailable\"}", 502);
        });
        server.start();

        try {
            URI baseUrl = URI.create("http://localhost:" + server.getAddress().getPort());
            GooglePlacesClient client = new GooglePlacesClient(
                    RestClient.builder(),
                    new GooglePlacesProperties(true, baseUrl, "places-test-secret"));
            RomePlaceQueryService service = new RomePlaceQueryService(
                    Optional.of(client),
                    Clock.fixed(Instant.parse("2026-08-19T08:01:00Z"), ZoneOffset.UTC));

            List<RomePlaceQueryService.RomePlaceEvidence> evidence =
                    service.fetchVerifiedPlaces();

            assertEquals(1, evidence.size());
            assertEquals("pantheon", evidence.getFirst().attractionId());
        } finally {
            server.stop(0);
        }
    }

    private static void respond(HttpExchange exchange, String responseBody) throws IOException {
        respond(exchange, responseBody, 200);
    }

    private static void respond(HttpExchange exchange, String responseBody, int status)
            throws IOException {
        byte[] body = responseBody.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(status, body.length);
        exchange.getResponseBody().write(body);
        exchange.close();
    }

    private static String pantheonJson() {
        return """
                {
                  "id": "ChIJqUCGZ09gLxMRLM42IPpl0co",
                  "displayName": {"text": "Pantheon", "languageCode": "en"},
                  "formattedAddress": "Piazza della Rotonda, 00186 Roma RM, Italy",
                  "location": {"latitude": 41.8986108, "longitude": 12.4768729},
                  "googleMapsUri": "https://maps.google.com/?cid=pantheon",
                  "businessStatus": "OPERATIONAL"
                }
                """;
    }

    private static String borgheseGalleryJson() {
        return """
                {
                  "id": "ChIJq-bXVgRhLxMRv3vgOXaktBs",
                  "displayName": {"text": "Galleria Borghese", "languageCode": "en"},
                  "formattedAddress": "Piazzale Scipione Borghese, 5, 00197 Roma RM, Italy",
                  "location": {"latitude": 41.914231, "longitude": 12.492143},
                  "googleMapsUri": "https://maps.google.com/?cid=borghese",
                  "businessStatus": "OPERATIONAL"
                }
                """;
    }

    private static String placeJson(
            String placeId, String name, String address, double latitude, double longitude) {
        return """
                {
                  "id": "%s",
                  "displayName": {"text": "%s", "languageCode": "en"},
                  "formattedAddress": "%s",
                  "location": {"latitude": %s, "longitude": %s},
                  "googleMapsUri": "https://maps.google.com/?cid=%s",
                  "businessStatus": "OPERATIONAL"
                }
                """.formatted(placeId, name, address, latitude, longitude, placeId);
    }
}
