package com.yanzhang.attractionbooking.bookingpriority.internal;

import com.yanzhang.attractionbooking.bookingpriority.OfficialBookingEvidence;
import com.yanzhang.attractionbooking.bookingpriority.OfficialBookingPolicy;
import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
class RomeOfficialBookingEvidenceCatalog {

    private static final LocalDate CHECKED_ON = LocalDate.of(2026, 8, 21);

    private static final List<OfficialBookingEvidence> EVIDENCE = List.of(
            evidence(
                    "colosseum-archaeological-park",
                    "Colosseum, Roman Forum and Palatine Hill",
                    OfficialBookingPolicy.TIMED_RESERVATION_REQUIRED,
                    "The Colosseum requires entry at a reserved time. The Roman Forum and Palatine Hill use the same combined ticket.",
                    "https://colosseo.it/en/tickets/colosseum-roman-forum-palatine/"),
            evidence(
                    "borghese-gallery",
                    "Borghese Gallery",
                    OfficialBookingPolicy.TIMED_RESERVATION_REQUIRED,
                    "The official ticket page requires a reservation and uses two-hour visit slots.",
                    "https://galleriaborghese.beniculturali.it/en/visita/info-biglietti/"),
            evidence(
                    "domus-aurea",
                    "Domus Aurea",
                    OfficialBookingPolicy.TIMED_RESERVATION_REQUIRED,
                    "The official operator publishes admission in limited scheduled time slots, including a ticket-only option.",
                    "https://colosseo.it/en/tickets/domus-aurea/"),
            evidence(
                    "capitoline-museums",
                    "Capitoline Museums",
                    OfficialBookingPolicy.ADVANCE_BOOKING_RECOMMENDED,
                    "Individual visitors can buy a same-day ticket, while the official site recommends advance online purchase.",
                    "https://www.museicapitolini.org/en/biglietti-e-prenotazioni/tickets-and-videoguides"),
            evidence(
                    "st-peters-basilica",
                    "St. Peter's Basilica",
                    OfficialBookingPolicy.FREE_GENERAL_ENTRY,
                    "Ordinary entry is free. The optional paid reservation guarantees a time and includes a digital audio guide.",
                    "https://www.basilicasanpietro.va/en/faq/is-it-possible-to-book-entrance-to-st-peter-s-basilica"),
            evidence(
                    "baths-of-caracalla",
                    "Baths of Caracalla",
                    OfficialBookingPolicy.NO_ADVANCE_RESERVATION_REQUIRED,
                    "The Italian Ministry of Culture states that reservations are not required for an ordinary visit.",
                    "https://cultura.gov.it/luogo/terme-di-caracalla"),
            evidence(
                    "trevi-fountain",
                    "Trevi Fountain",
                    OfficialBookingPolicy.OPTIONAL_PAID_AREA,
                    "The outside viewing area remains free. The enclosed internal area requires a separate ticket for visitors and non-residents.",
                    "https://www.comune.roma.it/web/it/notizia/biglietto-dingresso-fontana-di-trevi.page"),
            evidence(
                    "vatican-museums-sistine-chapel",
                    "Vatican Museums and Sistine Chapel",
                    OfficialBookingPolicy.TICKET_REQUIRED_TIMING_UNKNOWN,
                    "The official ticket covers the museums and Sistine Chapel, and an official online booking route is available.",
                    "https://www.museivaticani.va/content/museivaticani/en/organizza-visita/tariffe-e-biglietti.html"),
            evidence(
                    "pantheon",
                    "Pantheon",
                    OfficialBookingPolicy.TICKET_REQUIRED_TIMING_UNKNOWN,
                    "The official operator publishes ticket and reservation rules and states that skip-the-line entry does not exist.",
                    "https://direzionemuseiroma.cultura.gov.it/en/pantheon/"),
            evidence(
                    "castel-sant-angelo",
                    "Castel Sant'Angelo",
                    OfficialBookingPolicy.TICKET_REQUIRED_TIMING_UNKNOWN,
                    "The official operator publishes named-ticket and identity-check rules, but the verified source does not establish an advance-booking window.",
                    "https://direzionemuseiroma.cultura.gov.it/en/museo-nazionale-di-castel-santangelo/"));

    List<OfficialBookingEvidence> all() {
        return EVIDENCE;
    }

    private static OfficialBookingEvidence evidence(
            String attractionId,
            String attractionName,
            OfficialBookingPolicy policy,
            String factualBasis,
            String sourceUrl) {
        return new OfficialBookingEvidence(
                attractionId,
                attractionName,
                policy,
                factualBasis,
                URI.create(sourceUrl),
                CHECKED_ON);
    }
}
