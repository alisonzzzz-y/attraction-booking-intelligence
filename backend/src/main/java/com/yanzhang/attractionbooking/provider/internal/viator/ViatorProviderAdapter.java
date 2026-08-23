package com.yanzhang.attractionbooking.provider.internal.viator;

import com.yanzhang.attractionbooking.provider.Attraction;
import com.yanzhang.attractionbooking.provider.AttractionRequest;
import com.yanzhang.attractionbooking.provider.AttractionResult;
import com.yanzhang.attractionbooking.provider.Availability;
import com.yanzhang.attractionbooking.provider.AvailabilityQuery;
import com.yanzhang.attractionbooking.provider.BookingUrgencyEvidence;
import com.yanzhang.attractionbooking.provider.ExternalReference;
import com.yanzhang.attractionbooking.provider.OpeningHours;
import com.yanzhang.attractionbooking.provider.Price;
import com.yanzhang.attractionbooking.provider.ProviderAdapter;
import com.yanzhang.attractionbooking.provider.ProviderEnvironment;
import com.yanzhang.attractionbooking.provider.ProviderError;
import com.yanzhang.attractionbooking.provider.ProviderId;
import com.yanzhang.attractionbooking.provider.ProviderSearchResult;
import com.yanzhang.attractionbooking.provider.SourceMetadata;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Currency;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

final class ViatorProviderAdapter implements ProviderAdapter {

    static final String PRODUCT_REFERENCE_SYSTEM = "viator-product";

    private static final ProviderId PROVIDER_ID = new ProviderId("viator");

    private final ViatorHttpClient client;
    private final Clock clock;

    ViatorProviderAdapter(ViatorHttpClient client, Clock clock) {
        this.client = client;
        this.clock = clock;
    }

    @Override
    public ProviderId id() {
        return PROVIDER_ID;
    }

    @Override
    public ProviderEnvironment environment() {
        return ProviderEnvironment.SANDBOX;
    }

    @Override
    public ProviderSearchResult search(AvailabilityQuery query) {
        List<AttractionResult> results = new ArrayList<>();
        List<ProviderError> errors = new ArrayList<>();

        for (AttractionRequest attraction : query.attractions()) {
            Optional<String> productCode = productCode(attraction);
            if (productCode.isEmpty()) {
                errors.add(error(
                        ProviderError.Type.UNSUPPORTED_REQUEST,
                        "viator-product-reference-missing",
                        "The attraction has no verified Viator Sandbox product reference",
                        attraction));
                continue;
            }

            try {
                ViatorDtos.Product product = client.fetchProduct(productCode.get());
                ViatorDtos.Schedule schedule = client.fetchSchedule(productCode.get());
                validateResponses(productCode.get(), product, schedule);
                results.add(map(attraction, product, schedule));
            } catch (ViatorClientException exception) {
                errors.add(error(mapErrorType(exception.kind()), exception.code(), exception.getMessage(), attraction));
            } catch (RuntimeException exception) {
                errors.add(error(
                        ProviderError.Type.INVALID_RESPONSE,
                        "viator-mapping-failed",
                        "The Viator Sandbox response did not match the expected contract",
                        attraction));
            }
        }

        return new ProviderSearchResult(PROVIDER_ID, environment(), results, errors);
    }

    private AttractionResult map(
            AttractionRequest request, ViatorDtos.Product product, ViatorDtos.Schedule schedule) {
        Instant retrievedAt = clock.instant();
        SourceMetadata source = new SourceMetadata(
                SourceMetadata.Type.AFFILIATE_PROVIDER,
                PROVIDER_ID.value(),
                Optional.of(environment()),
                retrievedAt,
                SourceMetadata.Freshness.FRESH,
                productReferenceUrl(product.productUrl()));

        Set<ExternalReference> references = new HashSet<>(request.externalReferences());
        references.add(new ExternalReference(PRODUCT_REFERENCE_SYSTEM, product.productCode()));

        Attraction attraction = new Attraction(
                request.internalAttractionId(),
                request.displayName(),
                request.offeringType(),
                Optional.empty(),
                references,
                source);

        boolean active = "ACTIVE".equals(product.status());
        boolean hasSchedule = schedule.bookableItems() != null && !schedule.bookableItems().isEmpty();
        Availability.Status availabilityStatus = active && hasSchedule
                ? Availability.Status.SCHEDULED
                : Availability.Status.UNAVAILABLE;
        Optional<String> reasonCode = availabilityStatus == Availability.Status.UNAVAILABLE
                ? Optional.of(active ? "schedule-empty" : "product-inactive")
                : Optional.empty();

        Availability availability = new Availability(
                availabilityStatus,
                Set.of(),
                Optional.of(product.productCode()),
                Optional.empty(),
                reasonCode,
                source);

        BookingUrgencyEvidence urgency = new BookingUrgencyEvidence(
                BookingUrgencyEvidence.ReservationRequirement.UNKNOWN,
                bookingCutoff(product.bookingConfirmationSettings()),
                Optional.empty(),
                source);

        List<Price> prices = mapSummaryPrice(product.productCode(), schedule, source);

        return new AttractionResult(
                attraction,
                new OpeningHours(OpeningHours.Status.UNKNOWN, List.of(), source),
                urgency,
                availability,
                prices);
    }

    private static List<Price> mapSummaryPrice(
            String productCode, ViatorDtos.Schedule schedule, SourceMetadata source) {
        if (schedule.summary() == null
                || schedule.summary().fromPrice() == null
                || schedule.currency() == null
                || schedule.currency().isBlank()) {
            return List.of();
        }
        return List.of(new Price(
                schedule.summary().fromPrice(),
                Currency.getInstance(schedule.currency()),
                Price.Kind.FROM,
                Optional.of(productCode),
                Optional.empty(),
                source));
    }

    private static Optional<Duration> bookingCutoff(ViatorDtos.BookingConfirmationSettings settings) {
        if (settings == null || settings.bookingCutoffInMinutes() == null) {
            return Optional.empty();
        }
        int minutes = settings.bookingCutoffInMinutes();
        return minutes < 0 ? Optional.empty() : Optional.of(Duration.ofMinutes(minutes));
    }

    private static Optional<String> productCode(AttractionRequest attraction) {
        return attraction.externalReferences().stream()
                .filter(reference -> PRODUCT_REFERENCE_SYSTEM.equals(reference.system()))
                .map(ExternalReference::value)
                .findFirst();
    }

    private static void validateResponses(
            String requestedProductCode, ViatorDtos.Product product, ViatorDtos.Schedule schedule) {
        if (!requestedProductCode.equals(product.productCode())
                || !requestedProductCode.equals(schedule.productCode())
                || product.status() == null) {
            throw new IllegalArgumentException("Viator response identifiers do not match the request");
        }
    }

    private static Optional<URI> productReferenceUrl(String productUrl) {
        if (productUrl == null || productUrl.isBlank()) {
            return Optional.empty();
        }
        try {
            return Optional.of(new URI(productUrl));
        } catch (URISyntaxException exception) {
            return Optional.empty();
        }
    }

    private static ProviderError error(
            ProviderError.Type type, String code, String message, AttractionRequest attraction) {
        return new ProviderError(type, code, message, Set.of(attraction.internalAttractionId()));
    }

    private static ProviderError.Type mapErrorType(ViatorClientException.Kind kind) {
        return switch (kind) {
            case AUTHENTICATION -> ProviderError.Type.AUTHENTICATION;
            case RATE_LIMIT -> ProviderError.Type.RATE_LIMIT;
            case TIMEOUT -> ProviderError.Type.TIMEOUT;
            case UPSTREAM_FAILURE -> ProviderError.Type.UPSTREAM_FAILURE;
            case INVALID_RESPONSE -> ProviderError.Type.INVALID_RESPONSE;
            case NOT_FOUND -> ProviderError.Type.UNSUPPORTED_REQUEST;
        };
    }
}
