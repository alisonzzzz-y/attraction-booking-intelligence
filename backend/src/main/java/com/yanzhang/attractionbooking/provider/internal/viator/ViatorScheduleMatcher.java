package com.yanzhang.attractionbooking.provider.internal.viator;

import com.yanzhang.attractionbooking.provider.Availability;
import java.time.LocalDate;

/** Matches published schedules only; it does not confirm live inventory.
 *  仅匹配已发布排期，不确认实时余票。 */
final class ViatorScheduleMatcher {
    private ViatorScheduleMatcher() {}

    static Availability.Status status(ViatorDtos.Schedule schedule, LocalDate start, LocalDate end, LocalDate retrievedOn) {
        if (schedule.bookableItems() == null) return Availability.Status.UNKNOWN;
        boolean incomplete = false;
        for (var item : schedule.bookableItems()) {
            if (item.seasons() == null) { incomplete = true; continue; }
            for (var season : item.seasons()) {
                if (season.startDate() == null) { incomplete = true; continue; }
                LocalDate first = start.isAfter(season.startDate()) ? start : season.startDate();
                // Viator documents a 384-day horizon when the season has no end date.
                // Viator 文档规定无结束日期的排期最多延伸至当前日期之后 384 天。
                LocalDate seasonEnd = season.endDate() == null ? retrievedOn.plusDays(384) : season.endDate();
                LocalDate last = end.isBefore(seasonEnd) ? end : seasonEnd;
                if (first.isAfter(last)) continue;
                if (season.pricingRecords() == null) { incomplete = true; continue; }
                for (var record : season.pricingRecords()) {
                    if (record.daysOfWeek() == null || record.daysOfWeek().isEmpty()) {
                        incomplete = true; continue;
                    }
                    for (LocalDate date = first; !date.isAfter(last); date = date.plusDays(1)) {
                        if (!record.daysOfWeek().contains(date.getDayOfWeek().name())) continue;
                        // No timed entries means a date-level schedule, not a timed inventory check.
                        // 无分时条目时只确认日期排期，不推断分时余票。
                        if (record.timedEntries() == null || record.timedEntries().isEmpty()) {
                            return Availability.Status.SCHEDULED;
                        }
                        LocalDate visit = date;
                        if (record.timedEntries().stream().anyMatch(entry -> entry.unavailableDates() == null
                                || entry.unavailableDates().stream().noneMatch(blocked -> visit.equals(blocked.date())))) {
                            return Availability.Status.SCHEDULED;
                        }
                    }
                }
            }
        }
        return incomplete ? Availability.Status.UNKNOWN : Availability.Status.UNAVAILABLE;
    }
}
