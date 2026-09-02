package com.yanzhang.attractionbooking.provider.internal.viator;

import java.net.SocketTimeoutException;
import java.net.http.HttpClient;
import java.net.http.HttpTimeoutException;
import java.util.Objects;
import java.util.regex.Pattern;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

final class ViatorHttpClient {

    private static final Pattern PRODUCT_CODE = Pattern.compile("[A-Za-z0-9_-]+");

    private final RestClient restClient;
    private final int maxRetries;

    ViatorHttpClient(RestClient.Builder builder, ViatorProperties properties) {
        Objects.requireNonNull(builder, "RestClient builder must not be null");
        Objects.requireNonNull(properties, "Viator properties must not be null");
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(
                HttpClient.newBuilder().connectTimeout(properties.connectTimeout()).build());
        requestFactory.setReadTimeout(properties.readTimeout());
        this.restClient = builder.baseUrl(properties.baseUrl().toString())
                .requestFactory(requestFactory)
                .defaultHeader("exp-api-key", properties.requiredApiKey())
                .defaultHeader(HttpHeaders.ACCEPT_LANGUAGE, "en-US")
                .defaultHeader(HttpHeaders.ACCEPT, "application/json;version=2.0")
                .build();
        this.maxRetries = properties.maxRetries();
    }

    ViatorDtos.Product fetchProduct(String productCode) {
        validateProductCode(productCode);
        return get("products", productCode, ViatorDtos.Product.class);
    }

    ViatorDtos.Schedule fetchSchedule(String productCode) {
        validateProductCode(productCode);
        return get("availability/schedules", productCode, ViatorDtos.Schedule.class);
    }

    private <T> T get(String resourcePath, String productCode, Class<T> responseType) {
        for (int attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                T response = restClient.get()
                        .uri(uriBuilder -> uriBuilder.pathSegment(resourcePath.split("/"))
                                .pathSegment(productCode)
                                .build())
                        .retrieve()
                        .body(responseType);
                if (response == null) {
                    throw new ViatorClientException(
                            ViatorClientException.Kind.INVALID_RESPONSE,
                            "viator-empty-response",
                            "Viator returned an empty response");
                }
                return response;
            } catch (RestClientResponseException exception) {
                ViatorClientException mapped = responseException(exception.getStatusCode().value());
                if (shouldRetry(mapped, attempt)) {
                    continue;
                }
                throw mapped;
            } catch (ResourceAccessException exception) {
                ViatorClientException mapped = resourceAccessException(exception);
                if (shouldRetry(mapped, attempt)) {
                    continue;
                }
                throw mapped;
            } catch (RestClientException exception) {
                throw new ViatorClientException(
                        ViatorClientException.Kind.INVALID_RESPONSE,
                        "viator-invalid-response",
                        "The Viator Sandbox response could not be read");
            }
        }
        throw new IllegalStateException("Viator retry loop completed unexpectedly");
    }

    private static ViatorClientException resourceAccessException(ResourceAccessException exception) {
        if (causedByTimeout(exception)) {
            return new ViatorClientException(
                    ViatorClientException.Kind.TIMEOUT,
                    "viator-timeout",
                    "The Viator Sandbox request timed out");
        }
        return new ViatorClientException(
                ViatorClientException.Kind.UPSTREAM_FAILURE,
                "viator-unreachable",
                "The Viator Sandbox service could not be reached");
    }

    private static boolean causedByTimeout(Throwable exception) {
        for (Throwable current = exception; current != null; current = current.getCause()) {
            if (current instanceof SocketTimeoutException || current instanceof HttpTimeoutException) {
                return true;
            }
        }
        return false;
    }

    private boolean shouldRetry(ViatorClientException exception, int attempt) {
        return attempt < maxRetries
                && (exception.kind() == ViatorClientException.Kind.TIMEOUT
                        || exception.kind() == ViatorClientException.Kind.UPSTREAM_FAILURE);
    }

    private static ViatorClientException responseException(int statusCode) {
        if (statusCode == 401 || statusCode == 403) {
            return new ViatorClientException(
                    ViatorClientException.Kind.AUTHENTICATION,
                    "viator-authentication",
                    "Viator Sandbox rejected the configured credentials");
        }
        if (statusCode == 404) {
            return new ViatorClientException(
                    ViatorClientException.Kind.NOT_FOUND,
                    "viator-product-not-found",
                    "The requested Viator Sandbox product was not found");
        }
        if (statusCode == 408 || statusCode == 504) {
            return new ViatorClientException(
                    ViatorClientException.Kind.TIMEOUT,
                    "viator-timeout",
                    "The Viator Sandbox request timed out");
        }
        if (statusCode == 429) {
            return new ViatorClientException(
                    ViatorClientException.Kind.RATE_LIMIT,
                    "viator-rate-limit",
                    "Viator Sandbox rate-limited the request");
        }
        return new ViatorClientException(
                ViatorClientException.Kind.UPSTREAM_FAILURE,
                "viator-http-" + statusCode,
                "Viator Sandbox returned an upstream error");
    }

    private static void validateProductCode(String productCode) {
        if (productCode == null || !PRODUCT_CODE.matcher(productCode).matches()) {
            throw new ViatorClientException(
                    ViatorClientException.Kind.INVALID_RESPONSE,
                    "viator-invalid-product-code",
                    "The Viator product code is invalid");
        }
    }
}
