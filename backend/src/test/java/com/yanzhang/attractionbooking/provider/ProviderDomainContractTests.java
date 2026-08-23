package com.yanzhang.attractionbooking.provider;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URI;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.Test;

class ProviderDomainContractTests {

    @Test
    void rejectsAQueryWhoseEndDateIsBeforeItsStartDate() {
        AttractionRequest attraction = new AttractionRequest(
                "pantheon", "Pantheon", Set.of(new ExternalReference("google-place", "place-1")));

        assertThrows(
                IllegalArgumentException.class,
                () -> new AvailabilityQuery(
                        "Rome", LocalDate.of(2026, 9, 10), LocalDate.of(2026, 9, 9), List.of(attraction)));
    }

    @Test
    void keepsGooglePlaceIdAsAnExternalReference() {
        ExternalReference googlePlace = new ExternalReference("google-place", "ChIJqUCGZ09gLxMRLM42IPpl0co");
        AttractionRequest attraction = new AttractionRequest("pantheon", "Pantheon", Set.of(googlePlace));

        assertTrue(attraction.externalReferences().contains(googlePlace));
    }

    @Test
    void distinguishesUnknownAvailabilityFromARequestFailure() {
        SourceMetadata source = sandboxSource(SourceMetadata.Freshness.FRESH);
        Availability unknown = new Availability(
                Availability.Status.UNKNOWN,
                Set.of(),
                Optional.of("product-1"),
                Optional.empty(),
                Optional.empty(),
                source);
        Availability failed = new Availability(
                Availability.Status.REQUEST_FAILED,
                Set.of(),
                Optional.empty(),
                Optional.empty(),
                Optional.of("timeout"),
                source);

        assertEquals(Availability.Status.UNKNOWN, unknown.status());
        assertEquals(Availability.Status.REQUEST_FAILED, failed.status());
    }

    @Test
    void keepsStalenessSeparateFromAvailability() {
        SourceMetadata staleSource = sandboxSource(SourceMetadata.Freshness.STALE);
        Availability unavailable = new Availability(
                Availability.Status.UNAVAILABLE,
                Set.of(LocalDate.of(2026, 9, 10)),
                Optional.of("product-1"),
                Optional.of("option-1"),
                Optional.of("sold-out"),
                staleSource);

        assertEquals(Availability.Status.UNAVAILABLE, unavailable.status());
        assertEquals(SourceMetadata.Freshness.STALE, unavailable.source().freshness());
    }

    @Test
    void reportsPartialAndCompleteProviderFailuresWithoutDiscardingValidData() {
        ProviderError timeout = new ProviderError(
                ProviderError.Type.TIMEOUT, "provider-timeout", "Provider request timed out", Set.of("pantheon"));
        ProviderSearchResult partial = new ProviderSearchResult(
                new ProviderId("test-provider"),
                ProviderEnvironment.SANDBOX,
                List.of(testAttractionResult()),
                List.of(timeout));
        ProviderSearchResult failed = new ProviderSearchResult(
                new ProviderId("test-provider"), ProviderEnvironment.SANDBOX, List.of(), List.of(timeout));

        assertTrue(partial.isPartialFailure());
        assertFalse(partial.isCompleteFailure());
        assertTrue(failed.isCompleteFailure());
    }

    private static AttractionResult testAttractionResult() {
        SourceMetadata source = sandboxSource(SourceMetadata.Freshness.FRESH);
        Attraction attraction = new Attraction(
                "pantheon",
                "Pantheon",
                Optional.empty(),
                Set.of(new ExternalReference("google-place", "place-1")),
                source);
        OpeningHours hours = new OpeningHours(OpeningHours.Status.UNKNOWN, List.of(), source);
        BookingUrgencyEvidence evidence = new BookingUrgencyEvidence(
                BookingUrgencyEvidence.ReservationRequirement.UNKNOWN,
                Optional.empty(),
                Optional.empty(),
                source);
        Availability availability = new Availability(
                Availability.Status.UNKNOWN,
                Set.of(),
                Optional.empty(),
                Optional.empty(),
                Optional.empty(),
                source);
        return new AttractionResult(attraction, hours, evidence, availability, List.of());
    }

    private static SourceMetadata sandboxSource(SourceMetadata.Freshness freshness) {
        return new SourceMetadata(
                SourceMetadata.Type.AFFILIATE_PROVIDER,
                "test-provider",
                Optional.of(ProviderEnvironment.SANDBOX),
                Instant.parse("2026-08-19T08:00:00Z"),
                freshness,
                Optional.of(URI.create("https://example.test/source")));
    }
}
