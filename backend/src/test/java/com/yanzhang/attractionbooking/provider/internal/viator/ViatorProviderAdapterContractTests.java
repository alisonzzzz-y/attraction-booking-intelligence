package com.yanzhang.attractionbooking.provider.internal.viator;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import com.yanzhang.attractionbooking.provider.AttractionRequest;
import com.yanzhang.attractionbooking.provider.AttractionResult;
import com.yanzhang.attractionbooking.provider.Availability;
import com.yanzhang.attractionbooking.provider.AvailabilityQuery;
import com.yanzhang.attractionbooking.provider.ExternalReference;
import com.yanzhang.attractionbooking.provider.Price;
import com.yanzhang.attractionbooking.provider.ProviderAdapter;
import com.yanzhang.attractionbooking.provider.ProviderAdapterContract;
import com.yanzhang.attractionbooking.provider.ProviderEnvironment;
import com.yanzhang.attractionbooking.provider.ProviderError;
import com.yanzhang.attractionbooking.provider.ProviderSearchResult;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Set;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

class ViatorProviderAdapterContractTests extends ProviderAdapterContract {

    private static final String PRODUCT_CODE = "5569822P4";
    private static final String TEST_API_KEY = "sandbox-test-secret";
    private static final Instant RETRIEVED_AT = Instant.parse("2026-08-19T08:00:00Z");

    private HttpServer server;
    private ViatorProviderAdapter adapter;
    private final AtomicReference<String> receivedApiKey = new AtomicReference<>();
    private final AtomicReference<String> receivedAccept = new AtomicReference<>();
    private final AtomicReference<String> receivedLanguage = new AtomicReference<>();
    private int productStatus;
    private String productResponse;
    private int scheduleStatus;
    private String scheduleResponse;

    @BeforeEach
    void startServer() throws IOException {
        productStatus = 200;
        productResponse = activeProductJson();
        scheduleStatus = 200;
        scheduleResponse = scheduleJson();

        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/partner/products/" + PRODUCT_CODE, this::handleProduct);
        server.createContext("/partner/availability/schedules/" + PRODUCT_CODE, this::handleSchedule);
        server.start();

        URI baseUrl = URI.create("http://localhost:" + server.getAddress().getPort() + "/partner");
        ViatorProperties properties = new ViatorProperties(true, baseUrl, TEST_API_KEY);
        ViatorHttpClient client = new ViatorHttpClient(RestClient.builder(), properties);
        adapter = new ViatorProviderAdapter(client, Clock.fixed(RETRIEVED_AT, ZoneOffset.UTC));
    }

    @AfterEach
    void stopServer() {
        server.stop(0);
    }

    @Override
    protected ProviderAdapter adapter() {
        return adapter;
    }

    @Override
    protected AvailabilityQuery supportedQuery() {
        return query(pantheonRequest());
    }

    @Test
    void sendsRequiredHeadersAndMapsTheVerifiedSandboxProduct() {
        ProviderSearchResult result = adapter.search(supportedQuery());

        assertEquals(TEST_API_KEY, receivedApiKey.get());
        assertEquals("application/json;version=2.0", receivedAccept.get());
        assertEquals("en-US", receivedLanguage.get());
        assertEquals(ProviderEnvironment.SANDBOX, result.environment());
        assertTrue(result.errors().isEmpty());

        AttractionResult pantheon = result.attractions().getFirst();
        assertEquals(Availability.Status.SCHEDULED, pantheon.availability().status());
        assertEquals(RETRIEVED_AT, pantheon.availability().source().retrievedAt());
        assertEquals(ProviderEnvironment.SANDBOX, pantheon.availability().source().environment().orElseThrow());
        assertEquals(PRODUCT_CODE, pantheon.availability().productCode().orElseThrow());
        assertEquals(Price.Kind.FROM, pantheon.prices().getFirst().kind());
        assertEquals("17.00", pantheon.prices().getFirst().amount().toPlainString());
        assertEquals("EUR", pantheon.prices().getFirst().currency().getCurrencyCode());
        assertEquals(0, pantheon.bookingUrgencyEvidence().bookingCutoff().orElseThrow().toMinutes());

        // A date unavailable for one timed entry is not promoted to product-wide unavailability.
        assertTrue(pantheon.availability().explicitlyUnavailableDates().isEmpty());
    }

    @Test
    void keepsSuccessfulAttractionsWhenAnotherAttractionHasNoVerifiedMapping() {
        AttractionRequest unsupported = new AttractionRequest("colosseum", "Colosseum", Set.of());

        ProviderSearchResult result = adapter.search(new AvailabilityQuery(
                "Rome", LocalDate.parse("2026-08-20"), LocalDate.parse("2026-08-22"),
                List.of(pantheonRequest(), unsupported)));

        assertEquals(1, result.attractions().size());
        assertEquals(1, result.errors().size());
        assertTrue(result.isPartialFailure());
        assertEquals(ProviderError.Type.UNSUPPORTED_REQUEST, result.errors().getFirst().type());
        assertEquals(Set.of("colosseum"), result.errors().getFirst().affectedAttractionIds());
    }

    @Test
    void mapsAuthenticationFailureWithoutExposingTheApiKey() {
        productStatus = 403;
        productResponse = "{\"error\":\"forbidden\"}";

        ProviderSearchResult result = adapter.search(supportedQuery());

        assertTrue(result.isCompleteFailure());
        assertEquals(ProviderError.Type.AUTHENTICATION, result.errors().getFirst().type());
        assertFalse(result.errors().getFirst().message().contains(TEST_API_KEY));
        assertFalse(result.errors().getFirst().code().contains(TEST_API_KEY));
    }

    @Test
    void mapsAnInactiveProductToExplicitUnavailability() {
        productResponse = """
                {
                  "status": "INACTIVE",
                  "productCode": "5569822P4"
                }
                """;
        scheduleResponse = """
                {
                  "productCode": "5569822P4",
                  "bookableItems": [],
                  "currency": "EUR"
                }
                """;

        AttractionResult result = adapter.search(supportedQuery()).attractions().getFirst();

        assertEquals(Availability.Status.UNAVAILABLE, result.availability().status());
        assertEquals("product-inactive", result.availability().reasonCode().orElseThrow());
        assertTrue(result.prices().isEmpty());
    }

    private void handleProduct(HttpExchange exchange) throws IOException {
        captureHeaders(exchange);
        respond(exchange, productStatus, productResponse);
    }

    private void handleSchedule(HttpExchange exchange) throws IOException {
        captureHeaders(exchange);
        respond(exchange, scheduleStatus, scheduleResponse);
    }

    private void captureHeaders(HttpExchange exchange) {
        receivedApiKey.set(exchange.getRequestHeaders().getFirst("exp-api-key"));
        receivedAccept.set(exchange.getRequestHeaders().getFirst("Accept"));
        receivedLanguage.set(exchange.getRequestHeaders().getFirst("Accept-Language"));
    }

    private static void respond(HttpExchange exchange, int status, String response) throws IOException {
        byte[] body = response.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(status, body.length);
        exchange.getResponseBody().write(body);
        exchange.close();
    }

    private static AttractionRequest pantheonRequest() {
        return new AttractionRequest(
                "pantheon",
                "Pantheon",
                Set.of(new ExternalReference(ViatorProviderAdapter.PRODUCT_REFERENCE_SYSTEM, PRODUCT_CODE)));
    }

    private static AvailabilityQuery query(AttractionRequest request) {
        return new AvailabilityQuery(
                "Rome",
                LocalDate.parse("2026-08-20"),
                LocalDate.parse("2026-08-22"),
                List.of(request));
    }

    private static String activeProductJson() {
        return """
                {
                  "status": "ACTIVE",
                  "productCode": "5569822P4",
                  "title": "Pantheon Rome Entry Ticket",
                  "productUrl": "https://shop.live.rc.viator.com/en/12345/tours/Rome/example/d511-5569822P4",
                  "bookingConfirmationSettings": {
                    "bookingCutoffType": "START_TIME",
                    "bookingCutoffInMinutes": 0,
                    "confirmationType": "INSTANT"
                  }
                }
                """;
    }

    private static String scheduleJson() {
        return """
                {
                  "productCode": "5569822P4",
                  "bookableItems": [
                    {
                      "productOptionCode": "DEFAULT",
                      "seasons": [
                        {
                          "startDate": "2026-08-01",
                          "endDate": "2026-12-31",
                          "pricingRecords": [
                            {
                              "daysOfWeek": ["MONDAY", "TUESDAY"],
                              "timedEntries": [
                                {
                                  "startTime": "09:00",
                                  "unavailableDates": [
                                    {"date": "2026-08-21", "reason": "SOLD_OUT"}
                                  ]
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ],
                  "currency": "EUR",
                  "summary": {"fromPrice": 17.00}
                }
                """;
    }
}
