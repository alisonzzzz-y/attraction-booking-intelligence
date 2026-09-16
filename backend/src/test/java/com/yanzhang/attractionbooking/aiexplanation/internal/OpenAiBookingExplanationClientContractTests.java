package com.yanzhang.attractionbooking.aiexplanation.internal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import com.yanzhang.attractionbooking.aiexplanation.BookingExplanationFact;
import com.yanzhang.attractionbooking.service.BookingExplanationFacts;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.web.client.RestClient;

class OpenAiBookingExplanationClientContractTests {

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
    private final AtomicInteger requestCount = new AtomicInteger();
    private final AtomicReference<JsonNode> firstRequest = new AtomicReference<>();
    private final AtomicReference<JsonNode> secondRequest = new AtomicReference<>();
    private final AtomicReference<Scenario> scenario = new AtomicReference<>(Scenario.VALID);
    private final AtomicReference<String> finalSummary =
            new AtomicReference<>("This order follows the supplied official booking facts.");
    private HttpServer server;

    @BeforeEach
    void startServer() throws IOException {
        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/v1/responses", this::handleResponse);
        server.start();
    }

    @AfterEach
    void stopServer() {
        if (server != null) {
            server.stop(0);
        }
    }

    @Test
    void requiresTheFactsToolBeforeAcceptingAModelSummary() {
        OpenAiBookingExplanationClient client = client();

        String summary = client.explain(facts());

        assertEquals("This order follows the supplied official booking facts.", summary);
        assertEquals(2, requestCount.get());
        assertEquals("required", firstRequest.get().path("tool_choice").asText());
        assertEquals("get_rome_booking_facts", firstRequest.get().path("tools").get(0).path("name").asText());
        assertTrue(!secondRequest.get().has("previous_response_id"));
        assertTrue(!firstRequest.get().path("store").asBoolean());
        assertTrue(!secondRequest.get().path("store").asBoolean());
        assertEquals("user", secondRequest.get().path("input").get(0).path("role").asText());
        assertEquals("function_call", secondRequest.get().path("input").get(1).path("type").asText());
        assertEquals("function_call_output", secondRequest.get().path("input").get(2).path("type").asText());
        assertEquals(secondRequest.get().path("input").get(1).path("call_id").asText(),
                secondRequest.get().path("input").get(2).path("call_id").asText());
        assertTrue(secondRequest.get().path("input").get(2).path("output").asText().contains("colosseum"));
    }

    @Test
    void rejectsAResponseThatSkipsTheVerifiedFactsTool() {
        scenario.set(Scenario.NO_TOOL_CALL);

        AiExplanationClientException exception =
                assertThrows(AiExplanationClientException.class, () -> client().explain(facts()));

        assertEquals("The explanation model did not request verified booking facts", exception.getMessage());
        assertEquals(1, requestCount.get());
    }

    @Test
    void rejectsAToolRequestForDifferentTravelDates() {
        scenario.set(Scenario.WRONG_TOOL_ARGUMENTS);

        AiExplanationClientException exception =
                assertThrows(AiExplanationClientException.class, () -> client().explain(facts()));

        assertEquals("The explanation model requested facts outside this booking plan", exception.getMessage());
        assertEquals(1, requestCount.get());
    }

    @ParameterizedTest(name = "rejects unsupported model claim: {0}")
    @ValueSource(strings = {
        "Tickets cost 20 euros.",
        "Live availability is confirmed.",
        "The venue is sold out.",
        "See https://example.test for details."
    })
    void rejectsUnsupportedModelClaims(String unsupportedSummary) {
        finalSummary.set(unsupportedSummary);

        AiExplanationClientException exception =
                assertThrows(AiExplanationClientException.class, () -> client().explain(facts()));

        assertEquals("The explanation model exceeded the booking-fact boundary", exception.getMessage());
        assertEquals(2, requestCount.get());
    }

    @Test
    void rejectsAnEmptyModelAnswer() {
        scenario.set(Scenario.EMPTY_FINAL_RESPONSE);

        AiExplanationClientException exception =
                assertThrows(AiExplanationClientException.class, () -> client().explain(facts()));

        assertEquals("The explanation model returned no text", exception.getMessage());
        assertEquals(2, requestCount.get());
    }

    @Test
    void translatesAnUpstreamFailureIntoAControlledClientError() {
        scenario.set(Scenario.UPSTREAM_FAILURE);

        AiExplanationClientException exception =
                assertThrows(AiExplanationClientException.class, () -> client().explain(facts()));

        assertEquals("The explanation model is temporarily unavailable", exception.getMessage());
        assertEquals(1, requestCount.get());
    }

    private OpenAiBookingExplanationClient client() {
        URI baseUrl = URI.create("http://localhost:" + server.getAddress().getPort() + "/v1");
        return new OpenAiBookingExplanationClient(
                RestClient.builder(),
                objectMapper,
                new AiExplanationProperties(true, baseUrl, "test-server-key", "gpt-5.6", Duration.ofSeconds(2)));
    }

    private void handleResponse(HttpExchange exchange) throws IOException {
        JsonNode request = objectMapper.readTree(exchange.getRequestBody());
        int requestNumber = requestCount.incrementAndGet();
        if (requestNumber == 1) {
            firstRequest.set(request);
            if (scenario.get() == Scenario.UPSTREAM_FAILURE) {
                respond(exchange, 503, "{\"error\":\"temporary test failure\"}");
                return;
            }
            if (scenario.get() == Scenario.NO_TOOL_CALL) {
                respond(exchange, """
                        {"id":"resp_tool","output":[{"type":"message","content":[{
                          "type":"output_text","text":"I can answer without the tool."
                        }]}]}
                        """);
                return;
            }
            if (scenario.get() == Scenario.WRONG_TOOL_ARGUMENTS) {
                respond(exchange, """
                        {"id":"resp_tool","output":[{
                          "type":"function_call","call_id":"call_facts","name":"get_rome_booking_facts",
                          "arguments":"{\\"city\\":\\"Rome\\",\\"stayStartDate\\":\\"2026-10-01\\",\\"stayEndDate\\":\\"2026-10-03\\"}"
                        }]}
                        """);
                return;
            }
            respond(exchange, """
                    {"id":"resp_tool","output":[{
                      "type":"function_call","call_id":"call_facts","name":"get_rome_booking_facts",
                      "arguments":"{\\"city\\":\\"Rome\\",\\"stayStartDate\\":\\"2026-09-10\\",\\"stayEndDate\\":\\"2026-09-12\\"}"
                    }]}
                    """);
            return;
        }
        secondRequest.set(request);
        if (scenario.get() == Scenario.EMPTY_FINAL_RESPONSE) {
            respond(exchange, "{\"id\":\"resp_final\",\"output\":[]}");
            return;
        }
        respond(exchange, objectMapper.writeValueAsString(Map.of(
                "id", "resp_final",
                "output", List.of(Map.of(
                        "type", "message",
                        "content", List.of(Map.of("type", "output_text", "text", finalSummary.get())))))));
    }

    private static BookingExplanationFacts facts() {
        return new BookingExplanationFacts(
                "Rome",
                LocalDate.of(2026, 9, 10),
                LocalDate.of(2026, 9, 12),
                List.of(new BookingExplanationFact(
                        "colosseum",
                        "Colosseum",
                        "BOOK_FIRST",
                        "AS_SOON_AS_VISIT_DATE_IS_FIXED",
                        "TIMED_RESERVATION_REQUIRED",
                        "The operator requires a timed reservation.",
                        "Secure this before lower-priority visits.",
                        "rome-v1",
                        LocalDate.of(2026, 8, 25))));
    }

    private static void respond(HttpExchange exchange, String body) throws IOException {
        respond(exchange, 200, body);
    }

    private static void respond(HttpExchange exchange, int status, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(status, bytes.length);
        exchange.getResponseBody().write(bytes);
        exchange.close();
    }

    private enum Scenario {
        VALID,
        NO_TOOL_CALL,
        WRONG_TOOL_ARGUMENTS,
        EMPTY_FINAL_RESPONSE,
        UPSTREAM_FAILURE
    }
}
