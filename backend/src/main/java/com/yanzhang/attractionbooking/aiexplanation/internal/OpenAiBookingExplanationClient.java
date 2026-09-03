package com.yanzhang.attractionbooking.aiexplanation.internal;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.http.HttpClient;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.JsonNode;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

/**
 * A deliberately narrow Responses API client. The model must call the single booking-facts tool
 * before it can produce a summary. The client never gives the model direct provider access.
 */
final class OpenAiBookingExplanationClient {

    private static final String BOOKING_FACTS_TOOL = "get_rome_booking_facts";
    private static final Pattern FORBIDDEN_MODEL_DETAIL = Pattern.compile(
            "\\d|https?://|\\b(price|cost|euro|availability|available|inventory|sold out|capacity)\\b",
            Pattern.CASE_INSENSITIVE);

    private static final String INSTRUCTIONS = """
            You explain a Rome booking order for a traveller. You have exactly one tool,
            get_rome_booking_facts, and you must call it before answering. Treat its returned
            fields as the only facts. Do not use web search or outside knowledge. Do not generate
            or infer prices, ticket availability, capacity, sell-out dates, booking rules, or
            priorities. After the tool result, write one plain-English sentence of at most 25 words
            that only says the order follows the supplied official booking facts. Do not include
            numbers, dates, URLs, or attraction names.
            """;

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final AiExplanationProperties properties;

    OpenAiBookingExplanationClient(
            RestClient.Builder builder, ObjectMapper objectMapper, AiExplanationProperties properties) {
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(
                HttpClient.newBuilder().connectTimeout(properties.responseTimeout()).build());
        requestFactory.setReadTimeout(properties.responseTimeout());
        this.restClient = builder.baseUrl(properties.baseUrl().toString())
                .requestFactory(requestFactory)
                .defaultHeaders(headers -> headers.setBearerAuth(properties.requiredApiKey()))
                .build();
        this.objectMapper = objectMapper;
        this.properties = properties;
    }

    String explain(BookingExplanationFacts facts) {
        JsonNode firstResponse = create(firstRequest(facts));
        ToolCall toolCall = requiredBookingFactsToolCall(firstResponse, facts);
        JsonNode finalResponse = create(finalRequest(firstResponse, toolCall, facts));
        return validatedSummary(finalResponse);
    }

    private JsonNode create(Map<String, Object> request) {
        try {
            JsonNode response = restClient.post()
                    .uri("/responses")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(JsonNode.class);
            if (response == null) {
                throw new AiExplanationClientException("The explanation model returned an empty response");
            }
            return response;
        } catch (RestClientResponseException | ResourceAccessException exception) {
            throw new AiExplanationClientException("The explanation model is temporarily unavailable");
        } catch (RestClientException exception) {
            throw new AiExplanationClientException("The explanation model returned an invalid response");
        }
    }

    private Map<String, Object> firstRequest(BookingExplanationFacts facts) {
        return Map.of(
                "model", properties.model(),
                "instructions", INSTRUCTIONS,
                "input", "Explain the booking order for Rome from " + facts.stayStartDate()
                        + " to " + facts.stayEndDate() + ".",
                "tools", List.of(bookingFactsTool()),
                "tool_choice", "required",
                "parallel_tool_calls", false,
                "max_output_tokens", 160,
                "store", false);
    }

    private Map<String, Object> finalRequest(
            JsonNode firstResponse, ToolCall toolCall, BookingExplanationFacts facts) {
        String responseId = firstResponse.path("id").asText();
        if (responseId.isBlank()) {
            throw new AiExplanationClientException("The explanation model returned no response identifier");
        }
        return Map.of(
                "model", properties.model(),
                "instructions", INSTRUCTIONS,
                "previous_response_id", responseId,
                "input", List.of(Map.of(
                        "type", "function_call_output",
                        "call_id", toolCall.callId(),
                        "output", serialiseFacts(facts))),
                "tool_choice", "none",
                "max_output_tokens", 120,
                "store", false);
    }

    private ToolCall requiredBookingFactsToolCall(JsonNode response, BookingExplanationFacts expectedFacts) {
        JsonNode call = null;
        for (JsonNode outputItem : response.path("output")) {
            if ("function_call".equals(outputItem.path("type").asText())) {
                call = outputItem;
                break;
            }
        }
        if (call == null || !BOOKING_FACTS_TOOL.equals(call.path("name").asText())) {
            throw new AiExplanationClientException("The explanation model did not request verified booking facts");
        }
        String callId = call.path("call_id").asText();
        if (callId.isBlank()) {
            throw new AiExplanationClientException("The explanation model returned an invalid tool call");
        }
        validateToolArguments(call.path("arguments").asText(), expectedFacts);
        return new ToolCall(callId);
    }

    private void validateToolArguments(String rawArguments, BookingExplanationFacts expectedFacts) {
        try {
            com.fasterxml.jackson.databind.JsonNode arguments = objectMapper.readTree(rawArguments);
            boolean expected = "Rome".equals(arguments.path("city").asText())
                    && expectedFacts.stayStartDate().toString()
                            .equals(arguments.path("stayStartDate").asText())
                    && expectedFacts.stayEndDate().toString()
                            .equals(arguments.path("stayEndDate").asText());
            if (!expected) {
                throw new AiExplanationClientException("The explanation model requested facts outside this booking plan");
            }
        } catch (JsonProcessingException exception) {
            throw new AiExplanationClientException("The explanation model returned invalid tool arguments");
        }
    }

    private String validatedSummary(JsonNode response) {
        String text = response.path("output").findValues("content").stream()
                .flatMap(content -> java.util.stream.StreamSupport.stream(content.spliterator(), false))
                .filter(item -> "output_text".equals(item.path("type").asText()))
                .map(item -> item.path("text").asText())
                .filter(value -> !value.isBlank())
                .findFirst()
                .orElseThrow(() -> new AiExplanationClientException("The explanation model returned no text"));
        String normalised = text.replaceAll("\\s+", " ").trim();
        if (normalised.length() > 280 || FORBIDDEN_MODEL_DETAIL.matcher(normalised).find()) {
            throw new AiExplanationClientException("The explanation model exceeded the booking-fact boundary");
        }
        return normalised;
    }

    private String serialiseFacts(BookingExplanationFacts facts) {
        try {
            return objectMapper.writeValueAsString(facts);
        } catch (JsonProcessingException exception) {
            throw new AiExplanationClientException("Verified booking facts could not be prepared");
        }
    }

    private static Map<String, Object> bookingFactsTool() {
        return Map.of(
                "type", "function",
                "name", BOOKING_FACTS_TOOL,
                "description", "Read only the verified Rome booking facts for the requested stay.",
                "strict", true,
                "parameters", Map.of(
                        "type", "object",
                        "properties", Map.of(
                                "city", Map.of("type", "string", "enum", List.of("Rome")),
                                "stayStartDate", Map.of("type", "string"),
                                "stayEndDate", Map.of("type", "string")),
                        "required", List.of("city", "stayStartDate", "stayEndDate"),
                        "additionalProperties", false));
    }

    private record ToolCall(String callId) {}
}
