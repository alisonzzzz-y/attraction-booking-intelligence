package com.yanzhang.attractionbooking.configuration.internal.web;

import java.time.Instant;

record ApiError(Instant timestamp, int status, String error, String path) {
}
