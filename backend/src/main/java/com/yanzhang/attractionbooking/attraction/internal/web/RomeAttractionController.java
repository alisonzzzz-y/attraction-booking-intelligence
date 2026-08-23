package com.yanzhang.attractionbooking.attraction.internal.web;

import com.yanzhang.attractionbooking.attraction.internal.RomeAttractionQueryService;
import com.yanzhang.attractionbooking.provider.AttractionResult;
import com.yanzhang.attractionbooking.provider.Price;
import com.yanzhang.attractionbooking.provider.ProviderError;
import com.yanzhang.attractionbooking.provider.ProviderSearchResult;
import java.math.BigDecimal;
import java.net.URI;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/rome/attractions")
class RomeAttractionController {

    private final RomeAttractionQueryService queryService;

    RomeAttractionController(RomeAttractionQueryService queryService) {
        this.queryService = queryService;
    }

    @GetMapping
    RomeAttractionResponse search(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate stayStartDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate stayEndDate) {
        return RomeAttractionResponse.from(queryService.search(stayStartDate, stayEndDate));
    }

    record RomeAttractionResponse(
            String city,
            String provider,
            String environment,
            boolean partialFailure,
            List<AttractionView> attractions,
            List<ProviderErrorView> errors) {

        static RomeAttractionResponse from(ProviderSearchResult result) {
            return new RomeAttractionResponse(
                    "Rome",
                    result.providerId().value(),
                    result.environment().name(),
                    result.isPartialFailure(),
                    result.attractions().stream().map(AttractionView::from).toList(),
                    result.errors().stream().map(ProviderErrorView::from).toList());
        }
    }

    record AttractionView(
            String id,
            String name,
            String offeringType,
            String availabilityStatus,
            String reservationRequirement,
            List<PriceView> prices,
            SourceView source) {

        static AttractionView from(AttractionResult result) {
            return new AttractionView(
                    result.attraction().internalAttractionId(),
                    result.attraction().displayName(),
                    result.attraction().offeringType().name(),
                    result.availability().status().name(),
                    result.bookingUrgencyEvidence().reservationRequirement().name(),
                    result.prices().stream().map(PriceView::from).toList(),
                    SourceView.from(result.attraction().source()));
        }
    }

    record PriceView(BigDecimal amount, String currency, String kind) {

        static PriceView from(Price price) {
            return new PriceView(price.amount(), price.currency().getCurrencyCode(), price.kind().name());
        }
    }

    record SourceView(
            String provider,
            String environment,
            Instant retrievedAt,
            String freshness,
            Optional<URI> referenceUrl) {

        static SourceView from(com.yanzhang.attractionbooking.provider.SourceMetadata source) {
            return new SourceView(
                    source.sourceId(),
                    source.environment().map(Enum::name).orElse("UNKNOWN"),
                    source.retrievedAt(),
                    source.freshness().name(),
                    source.referenceUrl());
        }
    }

    record ProviderErrorView(String type, String code, String message, List<String> attractionIds) {

        static ProviderErrorView from(ProviderError error) {
            return new ProviderErrorView(
                    error.type().name(),
                    error.code(),
                    error.message(),
                    error.affectedAttractionIds().stream().sorted().toList());
        }
    }
}
