package com.yanzhang.attractionbooking.provider.internal.viator;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import com.yanzhang.attractionbooking.provider.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;

class ViatorAggregationTests {
    @Test void returnsHealthyResultsAndCancelsSlowProductsWithinTheTotalBudget() throws Exception {
        ViatorHttpClient client = mock(ViatorHttpClient.class);
        CountDownLatch cancelled = new CountDownLatch(1);
        when(client.fetchProduct("slow")).thenAnswer(invocation -> {
            try {
                new CountDownLatch(1).await();
            } catch (InterruptedException exception) {
                cancelled.countDown();
                Thread.currentThread().interrupt();
            }
            throw new ViatorClientException(ViatorClientException.Kind.TIMEOUT, "cancelled", "Cancelled");
        });
        when(client.fetchProduct("healthy")).thenReturn(new ViatorDtos.Product("ACTIVE", "healthy", "Healthy", null, null));
        when(client.fetchSchedule("healthy")).thenReturn(new ViatorDtos.Schedule("healthy", List.of(), "EUR", null));
        var adapter = new ViatorProviderAdapter(client, Clock.systemUTC(), Duration.ofMillis(500));
        var slow = new AttractionRequest("slow", "Slow", Set.of(new ExternalReference("viator-product", "slow")));
        var healthy = new AttractionRequest("healthy", "Healthy", Set.of(new ExternalReference("viator-product", "healthy")));
        var query = new AvailabilityQuery("Rome", LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 2), List.of(slow, healthy));

        var result = assertTimeoutPreemptively(Duration.ofSeconds(3), () -> adapter.search(query));

        assertEquals(1, result.attractions().size());
        assertEquals(1, result.errors().size());
        assertEquals(Set.of("slow"), result.errors().getFirst().affectedAttractionIds());
        assertEquals(ProviderError.Type.TIMEOUT, result.errors().getFirst().type());
        assertTrue(result.isPartialFailure());
        assertTrue(cancelled.await(1, TimeUnit.SECONDS));
    }
}
