package com.yanzhang.attractionbooking.provider;

import java.net.URI;
import java.time.Instant;
import java.util.Objects;
import java.util.Optional;

public record SourceMetadata(
        Type type,
        String sourceId,
        Optional<ProviderEnvironment> environment,
        Instant retrievedAt,
        Freshness freshness,
        Optional<URI> referenceUrl) {

    public SourceMetadata {
        Objects.requireNonNull(type, "Source type must not be null");
        if (sourceId == null || sourceId.isBlank()) {
            throw new IllegalArgumentException("Source ID must not be blank");
        }
        Objects.requireNonNull(environment, "Source environment must not be null");
        Objects.requireNonNull(retrievedAt, "Source retrieval time must not be null");
        Objects.requireNonNull(freshness, "Source freshness must not be null");
        Objects.requireNonNull(referenceUrl, "Source reference URL must not be null");
        if (type == Type.AFFILIATE_PROVIDER && environment.isEmpty()) {
            throw new IllegalArgumentException("Affiliate provider sources require an environment");
        }
    }

    public enum Type {
        OFFICIAL_OPERATOR,
        AFFILIATE_PROVIDER,
        MAP_PROVIDER
    }

    public enum Freshness {
        FRESH,
        STALE
    }
}
