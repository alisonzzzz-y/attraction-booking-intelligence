package com.yanzhang.attractionbooking.provider;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;

public abstract class ProviderAdapterContract {

    protected abstract ProviderAdapter adapter();

    protected abstract AvailabilityQuery supportedQuery();

    @Test
    void identifiesItsProviderAndEnvironment() {
        assertNotNull(adapter().id());
        assertNotNull(adapter().environment());
    }

    @Test
    void returnsAResultOwnedByTheSameProviderAndEnvironment() {
        ProviderSearchResult result = adapter().search(supportedQuery());

        assertEquals(adapter().id(), result.providerId());
        assertEquals(adapter().environment(), result.environment());
    }
}
