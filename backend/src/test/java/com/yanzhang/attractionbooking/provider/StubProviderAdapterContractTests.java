package com.yanzhang.attractionbooking.provider;

import java.net.URI;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

class StubProviderAdapterContractTests extends ProviderAdapterContract {

    private final ProviderAdapter adapter = new StubProviderAdapter();

    @Override
    protected ProviderAdapter adapter() {
        return adapter;
    }

    @Override
    protected AvailabilityQuery supportedQuery() {
        return new AvailabilityQuery(
                "Rome",
                LocalDate.of(2026, 9, 10),
                LocalDate.of(2026, 9, 12),
                List.of(new AttractionRequest("pantheon", "Pantheon", Set.of())));
    }

    private static final class StubProviderAdapter implements ProviderAdapter {

        private static final ProviderId ID = new ProviderId("contract-stub");

        @Override
        public ProviderId id() {
            return ID;
        }

        @Override
        public ProviderEnvironment environment() {
            return ProviderEnvironment.SANDBOX;
        }

        @Override
        public ProviderSearchResult search(AvailabilityQuery query) {
            SourceMetadata source = new SourceMetadata(
                    SourceMetadata.Type.AFFILIATE_PROVIDER,
                    ID.value(),
                    Optional.of(environment()),
                    Instant.parse("2026-08-19T08:00:00Z"),
                    SourceMetadata.Freshness.FRESH,
                    Optional.of(URI.create("https://example.test/contract-stub")));
            AttractionRequest requested = query.attractions().getFirst();
            Attraction attraction = new Attraction(
                    requested.internalAttractionId(),
                    requested.displayName(),
                    Optional.empty(),
                    requested.externalReferences(),
                    source);
            AttractionResult result = new AttractionResult(
                    attraction,
                    new OpeningHours(OpeningHours.Status.UNKNOWN, List.of(), source),
                    new BookingUrgencyEvidence(
                            BookingUrgencyEvidence.ReservationRequirement.UNKNOWN,
                            Optional.empty(),
                            Optional.empty(),
                            source),
                    new Availability(
                            Availability.Status.UNKNOWN,
                            Set.of(),
                            Optional.empty(),
                            Optional.empty(),
                            Optional.empty(),
                            source),
                    List.of());
            return new ProviderSearchResult(ID, environment(), List.of(result), List.of());
        }
    }
}
