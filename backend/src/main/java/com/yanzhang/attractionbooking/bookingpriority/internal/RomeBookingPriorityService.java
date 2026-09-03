package com.yanzhang.attractionbooking.bookingpriority.internal;

import com.yanzhang.attractionbooking.bookingpriority.BookingPriorityAssessment;
import com.yanzhang.attractionbooking.bookingpriority.RomeBookingPriorityQuery;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
class RomeBookingPriorityService implements RomeBookingPriorityQuery {

    private static final long MAXIMUM_STAY_DAYS = 31;

    private final RomeOfficialBookingEvidenceCatalog catalog;
    private final BookingPriorityCalculator calculator;

    RomeBookingPriorityService(
            RomeOfficialBookingEvidenceCatalog catalog,
            BookingPriorityCalculator calculator) {
        this.catalog = catalog;
        this.calculator = calculator;
    }

    @Override
    public List<BookingPriorityAssessment> assess(LocalDate stayStartDate, LocalDate stayEndDate) {
        validate(stayStartDate, stayEndDate);
        return catalog.all().stream()
                .map(calculator::assess)
                .sorted(Comparator.comparingInt(assessment -> assessment.priority().ordinal()))
                .toList();
    }

    private static void validate(LocalDate stayStartDate, LocalDate stayEndDate) {
        if (stayStartDate == null || stayEndDate == null) {
            throw new IllegalArgumentException("Both stay dates are required");
        }
        long inclusiveStayDays = ChronoUnit.DAYS.between(stayStartDate, stayEndDate) + 1;
        if (inclusiveStayDays <= 0) {
            throw new IllegalArgumentException("Stay end date must not be before start date");
        }
        if (inclusiveStayDays > MAXIMUM_STAY_DAYS) {
            throw new IllegalArgumentException("Rome MVP stays cannot exceed 31 days");
        }
    }
}
