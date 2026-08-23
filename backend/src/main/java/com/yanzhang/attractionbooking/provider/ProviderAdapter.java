package com.yanzhang.attractionbooking.provider;

public interface ProviderAdapter {

    ProviderId id();

    ProviderEnvironment environment();

    ProviderSearchResult search(AvailabilityQuery query);
}
