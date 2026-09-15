package com.yanzhang.attractionbooking.controller;

import java.time.Instant;

public record ApiError(Instant timestamp, int status, String error, String path) {
}
