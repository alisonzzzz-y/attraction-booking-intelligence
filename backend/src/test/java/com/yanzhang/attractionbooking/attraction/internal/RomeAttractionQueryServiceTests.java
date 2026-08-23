package com.yanzhang.attractionbooking.attraction.internal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.yanzhang.attractionbooking.provider.AvailabilityQuery;
import com.yanzhang.attractionbooking.provider.ProviderAdapter;
import com.yanzhang.attractionbooking.provider.ProviderEnvironment;
import com.yanzhang.attractionbooking.provider.ProviderId;
import com.yanzhang.attractionbooking.provider.ProviderSearchResult;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class RomeAttractionQueryServiceTests {

    private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-08-19T08:00:00Z"), ZoneOffset.UTC);

    @Test
    void sendsAllVerifiedAttractionMappingsToViator() {
        var adapter = new CapturingViatorAdapter();
        var service = new RomeAttractionQueryService(List.of(adapter), CLOCK);

        service.search(LocalDate.of(2026, 9, 10), LocalDate.of(2026, 9, 12));

        assertThat(adapter.query.city()).isEqualTo("Rome");
        assertThat(adapter.query.attractions()).hasSize(6);
        assertThat(adapter.query.attractions()).anySatisfy(attraction -> {
            assertThat(attraction.internalAttractionId()).isEqualTo("pantheon");
            assertThat(attraction.externalReferences())
                    .anySatisfy(reference -> {
                        assertThat(reference.system()).isEqualTo("viator-product");
                        assertThat(reference.value()).isEqualTo("5569822P4");
                    });
        });
        assertThat(adapter.query.attractions()).anySatisfy(attraction -> {
            assertThat(attraction.internalAttractionId()).isEqualTo("borghese-gallery");
            assertThat(attraction.externalReferences())
                    .anySatisfy(reference -> {
                        assertThat(reference.system()).isEqualTo("viator-product");
                        assertThat(reference.value()).isEqualTo("403837P1");
                    });
        });
        assertThat(adapter.query.attractions()).anySatisfy(attraction -> {
            assertThat(attraction.internalAttractionId()).isEqualTo("colosseum-archaeological-park");
            assertThat(attraction.offeringType().name()).isEqualTo("GUIDED_TOUR");
            assertThat(attraction.externalReferences())
                    .anySatisfy(reference -> {
                        assertThat(reference.system()).isEqualTo("viator-product");
                        assertThat(reference.value()).isEqualTo("15932P15");
                    });
        });
        assertThat(adapter.query.attractions()).anySatisfy(attraction -> {
            assertThat(attraction.internalAttractionId()).isEqualTo("borghese-gallery");
            assertThat(attraction.offeringType().name()).isEqualTo("TICKET_WITH_AUDIO_GUIDE");
        });
        assertThat(adapter.query.attractions()).anySatisfy(attraction -> {
            assertThat(attraction.internalAttractionId())
                    .isEqualTo("vatican-museums-sistine-chapel");
            assertThat(attraction.offeringType().name()).isEqualTo("TICKET_PRODUCT");
            assertThat(attraction.externalReferences())
                    .anySatisfy(reference -> {
                        assertThat(reference.system()).isEqualTo("viator-product");
                        assertThat(reference.value()).isEqualTo("144387P2");
                    });
        });
        assertThat(adapter.query.attractions()).anySatisfy(attraction -> {
            assertThat(attraction.internalAttractionId()).isEqualTo("baths-of-caracalla");
            assertThat(attraction.offeringType().name()).isEqualTo("TICKET_WITH_AUDIO_GUIDE");
            assertThat(attraction.externalReferences())
                    .anySatisfy(reference -> {
                        assertThat(reference.system()).isEqualTo("viator-product");
                        assertThat(reference.value()).isEqualTo("247354P40");
                    });
        });
        assertThat(adapter.query.attractions()).anySatisfy(attraction -> {
            assertThat(attraction.internalAttractionId()).isEqualTo("capitoline-museums");
            assertThat(attraction.offeringType().name()).isEqualTo("TICKET_PRODUCT");
            assertThat(attraction.externalReferences())
                    .anySatisfy(reference -> {
                        assertThat(reference.system()).isEqualTo("viator-product");
                        assertThat(reference.value()).isEqualTo("14982P113");
                    });
        });
    }

    @Test
    void rejectsPastAndOverlongDateRangesBeforeCallingAProvider() {
        var service = new RomeAttractionQueryService(List.of(new CapturingViatorAdapter()), CLOCK);

        assertThatIllegalArgumentException()
                .isThrownBy(() -> service.search(LocalDate.of(2026, 8, 18), LocalDate.of(2026, 8, 20)))
                .withMessage("Stay start date must not be in the past");
        assertThatIllegalArgumentException()
                .isThrownBy(() -> service.search(LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 15)))
                .withMessage("A Rome stay can cover at most 14 days");
    }

    @Test
    void reportsWhenTheAuthorisedProviderIsNotConfigured() {
        var service = new RomeAttractionQueryService(List.of(), CLOCK);

        assertThatThrownBy(() -> service.search(LocalDate.of(2026, 9, 10), LocalDate.of(2026, 9, 12)))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE));
    }

    private static final class CapturingViatorAdapter implements ProviderAdapter {

        private AvailabilityQuery query;

        @Override
        public ProviderId id() {
            return new ProviderId("viator");
        }

        @Override
        public ProviderEnvironment environment() {
            return ProviderEnvironment.SANDBOX;
        }

        @Override
        public ProviderSearchResult search(AvailabilityQuery query) {
            this.query = query;
            return new ProviderSearchResult(
                    id(),
                    environment(),
                    List.of(),
                    List.of(new com.yanzhang.attractionbooking.provider.ProviderError(
                            com.yanzhang.attractionbooking.provider.ProviderError.Type.UPSTREAM_FAILURE,
                            "test-only",
                            "Test response",
                            java.util.Set.of(
                                    "pantheon",
                                    "borghese-gallery",
                                    "colosseum-archaeological-park",
                                    "vatican-museums-sistine-chapel",
                                    "baths-of-caracalla",
                                    "capitoline-museums"))));
        }
    }
}
