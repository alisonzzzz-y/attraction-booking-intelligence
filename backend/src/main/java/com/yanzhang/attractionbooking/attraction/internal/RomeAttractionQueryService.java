package com.yanzhang.attractionbooking.attraction.internal;

import com.yanzhang.attractionbooking.provider.AttractionRequest;
import com.yanzhang.attractionbooking.provider.AvailabilityQuery;
import com.yanzhang.attractionbooking.provider.ExternalReference;
import com.yanzhang.attractionbooking.provider.OfferingType;
import com.yanzhang.attractionbooking.provider.ProviderAdapter;
import com.yanzhang.attractionbooking.provider.ProviderSearchResult;
import java.time.Clock;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RomeAttractionQueryService {

    private static final int MAX_STAY_DAYS = 14;
    private static final String VIATOR_PRODUCT_REFERENCE = "viator-product";

    private final List<ProviderAdapter> providerAdapters;
    private final Clock clock;

    @Autowired
    public RomeAttractionQueryService(List<ProviderAdapter> providerAdapters) {
        this(providerAdapters, Clock.systemUTC());
    }

    RomeAttractionQueryService(List<ProviderAdapter> providerAdapters, Clock clock) {
        this.providerAdapters = List.copyOf(providerAdapters);
        this.clock = clock;
    }

    public ProviderSearchResult search(LocalDate stayStartDate, LocalDate stayEndDate) {
        validateDates(stayStartDate, stayEndDate);

        ProviderAdapter provider = providerAdapters.stream()
                .filter(adapter -> "viator".equals(adapter.id().value()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.SERVICE_UNAVAILABLE,
                        "The authorised ticket provider is not configured"));

        var pantheon = new AttractionRequest(
                "pantheon",
                "Pantheon",
                OfferingType.TICKET_PRODUCT,
                Set.of(new ExternalReference(VIATOR_PRODUCT_REFERENCE, "5569822P4")));
        var borgheseGallery = new AttractionRequest(
                "borghese-gallery",
                "Borghese Gallery",
                OfferingType.TICKET_WITH_AUDIO_GUIDE,
                Set.of(new ExternalReference(VIATOR_PRODUCT_REFERENCE, "403837P1")));
        var colosseumArchaeologicalPark = new AttractionRequest(
                "colosseum-archaeological-park",
                "Colosseum Archaeological Park",
                OfferingType.GUIDED_TOUR,
                Set.of(new ExternalReference(VIATOR_PRODUCT_REFERENCE, "15932P15")));
        var vaticanMuseumsAndSistineChapel = new AttractionRequest(
                "vatican-museums-sistine-chapel",
                "Vatican Museums and Sistine Chapel",
                OfferingType.TICKET_PRODUCT,
                Set.of(new ExternalReference(VIATOR_PRODUCT_REFERENCE, "144387P2")));
        var bathsOfCaracalla = new AttractionRequest(
                "baths-of-caracalla",
                "Baths of Caracalla",
                OfferingType.TICKET_WITH_AUDIO_GUIDE,
                Set.of(new ExternalReference(VIATOR_PRODUCT_REFERENCE, "247354P40")));
        var capitolineMuseums = new AttractionRequest(
                "capitoline-museums",
                "Capitoline Museums",
                OfferingType.TICKET_PRODUCT,
                Set.of(new ExternalReference(VIATOR_PRODUCT_REFERENCE, "14982P113")));

        return provider.search(new AvailabilityQuery(
                "Rome",
                stayStartDate,
                stayEndDate,
                List.of(
                        pantheon,
                        borgheseGallery,
                        colosseumArchaeologicalPark,
                        vaticanMuseumsAndSistineChapel,
                        bathsOfCaracalla,
                        capitolineMuseums)));
    }

    private void validateDates(LocalDate stayStartDate, LocalDate stayEndDate) {
        if (stayStartDate == null || stayEndDate == null) {
            throw new IllegalArgumentException("Both stay dates are required");
        }
        if (stayStartDate.isBefore(LocalDate.now(clock))) {
            throw new IllegalArgumentException("Stay start date must not be in the past");
        }
        if (stayEndDate.isBefore(stayStartDate)) {
            throw new IllegalArgumentException("Stay end date must not be before the start date");
        }
        long inclusiveDays = ChronoUnit.DAYS.between(stayStartDate, stayEndDate) + 1;
        if (inclusiveDays > MAX_STAY_DAYS) {
            throw new IllegalArgumentException("A Rome stay can cover at most 14 days");
        }
    }
}
