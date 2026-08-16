package com.yanzhang.attractionbooking.configuration.internal.web;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<ApiError> handleInvalidRequest(
            IllegalArgumentException exception,
            HttpServletRequest request) {
        var error = new ApiError(
                Instant.now(),
                HttpStatus.BAD_REQUEST.value(),
                exception.getMessage(),
                request.getRequestURI());

        return ResponseEntity.badRequest().body(error);
    }
}
