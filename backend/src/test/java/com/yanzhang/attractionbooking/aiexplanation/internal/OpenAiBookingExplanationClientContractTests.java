package com.yanzhang.attractionbooking.aiexplanation.internal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import com.yanzhang.attractionbooking.aiexplanation.BookingExplanationFact;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

class OpenAiBookingExplanationClientContractTests {

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
    private final AtomicInteger requestCount = new AtomicInteger();
    private final AtomicReference<JsonNode> firstRequest = new AtomicReference<>();
    private final AtomicReference<JsonNode> secondRequest = new AtomicReference<>();
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
        URI baseUrl = URI.create("http://localhost:" + server.getAddress().getPort() + "/v1");
        OpenAiBookingExplanationClient client = new OpenAiBookingExplanationClient(
                RestClient.builder(),
                objectMapper,
                new AiExplanationProperties(true, baseUrl, "test-server-key", "gpt-5.6", Duration.ofSeconds(2)));

        String summary = client.explain(facts());

        assertEquals("This order follows the supplied official booking facts.", summary);
        assertEquals(2, requestCount.get());
        assertEquals("required", firstRequest.get().path("tool_choice").asText());
        assertEquals("get_rome_booking_facts", firstRequest.get().path("tools").get(0).path("name").asText());
        assertEquals("resp_tool", secondRequest.get().path("previous_response_id").asText());
        assertEquals("function_call_output", secondRequest.get().path("input").get(0).path("type").asText());
        assertTrue(secondRequest.get().path("input").get(0).path("output").asText().contains("colosseum"));
    }

    private void handleResponse(HttpExchange exchange) throws IOException {
        JsonNode request = objectMapper.readTree(exchange.getRequestBody());
        int requestNumber = requestCount.incrementAndGet();
        if (requestNumber == 1) {
            firstRequest.set(request);
            respond(exchange, """
                    {"id":"resp_tool","output":[{
                      "type":"function_call","call_id":"call_facts","name":"get_rome_booking_facts",
                      "arguments":"{\\"city\\":\\"Rome\\",\\"stayStartDate\\":\\"2026-09-10\\",\\"stayEndDate\\":\\"2026-09-12\\"}"
                    }]}
                    """);
            return;
        }
        secondRequest.set(request);
        respond(exchange, """
                {"id":"resp_final","output":[{"type":"message","content":[{
                  "type":"output_text","text":"This order follows the supplied official booking facts."
                }]}]}
                """);
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
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(200, bytes.length);
        exchange.getResponseBody().write(bytes);
        exchange.close();
    }
}
