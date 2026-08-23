package com.yanzhang.attractionbooking.provider.internal.viator;

final class ViatorClientException extends RuntimeException {

    private final Kind kind;
    private final String code;

    ViatorClientException(Kind kind, String code, String message) {
        super(message);
        this.kind = kind;
        this.code = code;
    }

    Kind kind() {
        return kind;
    }

    String code() {
        return code;
    }

    enum Kind {
        AUTHENTICATION,
        RATE_LIMIT,
        TIMEOUT,
        UPSTREAM_FAILURE,
        INVALID_RESPONSE,
        NOT_FOUND
    }
}
