package com.yanzhang.attractionbooking.bookingpriority.internal;

import com.yanzhang.attractionbooking.bookingpriority.OfficialBookingEvidence;
import com.yanzhang.attractionbooking.bookingpriority.OfficialBookingPolicy;
import com.yanzhang.attractionbooking.bookingpriority.OfficialAttractionDetails;
import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
class RomeOfficialBookingEvidenceCatalog {

    private static final LocalDate CHECKED_ON = LocalDate.of(2026, 8, 25);

    private static final List<OfficialBookingEvidence> EVIDENCE = List.of(
            evidence(
                    "colosseum-archaeological-park",
                    "Colosseum, Roman Forum and Palatine Hill",
                    OfficialBookingPolicy.TIMED_RESERVATION_REQUIRED,
                    "The Colosseum requires entry at a reserved time. The Roman Forum and Palatine Hill use the same combined ticket.",
                    details(
                            "Ancient Rome's largest amphitheatre. The standard official visit is combined with the Roman Forum and Palatine Hill.",
                            "Official standard combined ticket",
                            List.of(
                                    "Timed entry to the Colosseum",
                                    "Entry to the Roman Forum",
                                    "Entry to Palatine Hill"),
                            "Recommended starting point",
                            "Covers the three main sites in one official combined ticket."),
                    "https://colosseo.it/en/tickets/colosseum-roman-forum-palatine/",
                    "https://ticketing.colosseo.it/en"),
            evidence(
                    "borghese-gallery",
                    "Borghese Gallery",
                    OfficialBookingPolicy.TIMED_RESERVATION_REQUIRED,
                    "The official ticket page requires a reservation and uses two-hour visit slots.",
                    details(
                            "An art museum in Villa Borghese with visits organised in reserved two-hour slots.",
                            "Official timed museum ticket",
                            List.of("Reserved entry to the Borghese Gallery", "A two-hour visit slot"),
                            "Official timed ticket",
                            "The official visit requires a reservation for a fixed two-hour slot."),
                    "https://galleriaborghese.beniculturali.it/en/wp-content/uploads/Guidelines-on-the-new-procedures-for-visits.pdf",
                    "https://www.galleriaborghese.it/"),
            evidence(
                    "domus-aurea",
                    "Domus Aurea",
                    OfficialBookingPolicy.TIMED_RESERVATION_REQUIRED,
                    "The official operator publishes admission in limited scheduled time slots, including a ticket-only option.",
                    details(
                            "Nero's archaeological palace complex, visited through limited scheduled admission slots.",
                            "Official scheduled admission",
                            List.of("Entry to the Domus Aurea", "A reserved admission slot"),
                            "Official scheduled visit",
                            "Limited official slots make this the clearest place to start."),
                    "https://colosseo.it/en/tickets/domus-aurea/",
                    "https://ticketing.colosseo.it/en"),
            evidence(
                    "capitoline-museums",
                    "Capitoline Museums",
                    OfficialBookingPolicy.ADVANCE_BOOKING_RECOMMENDED,
                    "Individual visitors can buy a same-day ticket, while the official site recommends advance online purchase.",
                    details(
                            "Rome's civic museum collection on Capitoline Hill.",
                            "Official museum admission",
                            List.of("Entry to the Capitoline Museums"),
                            "Official standard ticket",
                            "The official route supports both same-day and advance purchase."),
                    "https://www.museicapitolini.org/en/node/1011298",
                    "https://museiincomuneroma.vivaticket.it/"),
            evidence(
                    "st-peters-basilica",
                    "St. Peter's Basilica",
                    OfficialBookingPolicy.FREE_GENERAL_ENTRY,
                    "Ordinary entry is free. The optional paid reservation guarantees a time and includes a digital audio guide.",
                    details(
                            "The principal basilica of Vatican City. Ordinary entry is free.",
                            "Free general entry",
                            List.of("Ordinary entry to St. Peter's Basilica"),
                            "Free general entry",
                            "A paid timed reservation is optional and includes a digital audio guide."),
                    "https://www.basilicasanpietro.va/en/faq/is-it-possible-to-book-entrance-to-st-peter-s-basilica",
                    "https://booking.basilicasanpietro.va/en/"),
            evidence(
                    "baths-of-caracalla",
                    "Baths of Caracalla",
                    OfficialBookingPolicy.NO_ADVANCE_RESERVATION_REQUIRED,
                    "The Italian Ministry of Culture states that reservations are not required for an ordinary visit.",
                    details(
                            "A large Roman imperial bath complex open as an archaeological site.",
                            "Official standard admission",
                            List.of("Entry to the Baths of Caracalla"),
                            "Official standard ticket",
                            "The official source says ordinary visits do not require a reservation."),
                    "https://cultura.gov.it/luogo/terme-di-caracalla",
                    "https://www.museiitaliani.it/"),
            evidence(
                    "trevi-fountain",
                    "Trevi Fountain",
                    OfficialBookingPolicy.OPTIONAL_PAID_AREA,
                    "The outside viewing area remains free. The enclosed internal area requires a separate ticket for visitors and non-residents.",
                    details(
                            "Rome's monumental Baroque fountain. The outside viewing area remains free.",
                            "Optional inner-area ticket",
                            List.of("Entry to the enclosed inner area"),
                            "Optional paid area",
                            "The normal outside view is free; only the enclosed area needs a ticket."),
                    "https://www.comune.roma.it/web/it/notizia/biglietto-dingresso-fontana-di-trevi.page",
                    "https://fontanaditrevi.vivaticket.it/"),
            evidence(
                    "vatican-museums-sistine-chapel",
                    "Vatican Museums and Sistine Chapel",
                    OfficialBookingPolicy.TICKET_REQUIRED_TIMING_UNKNOWN,
                    "The official ticket covers the museums and Sistine Chapel, and an official online booking route is available.",
                    details(
                            "The Vatican art collections, with the Sistine Chapel included in the museum visit.",
                            "Official Vatican Museums ticket",
                            List.of("Entry to the Vatican Museums", "Entry to the Sistine Chapel"),
                            "Official combined visit",
                            "The official ticket covers both the museums and the Sistine Chapel."),
                    "https://www.museivaticani.va/content/museivaticani/en.html",
                    "https://tickets.museivaticani.va/home"),
            evidence(
                    "pantheon",
                    "Pantheon",
                    OfficialBookingPolicy.TICKET_REQUIRED_TIMING_UNKNOWN,
                    "The official operator publishes ticket and reservation rules and states that skip-the-line entry does not exist.",
                    details(
                            "A preserved ancient Roman monument, now visited as a ticketed cultural site.",
                            "Official Pantheon ticket",
                            List.of("Entry to the Pantheon"),
                            "Official standard ticket",
                            "Use the official route because the operator states that skip-the-line entry does not exist."),
                    "https://direzionemuseiroma.cultura.gov.it/en/pantheon/",
                    "https://portale.museiitaliani.it/"),
            evidence(
                    "castel-sant-angelo",
                    "Castel Sant'Angelo",
                    OfficialBookingPolicy.TICKET_REQUIRED_TIMING_UNKNOWN,
                    "The official operator publishes named-ticket and identity-check rules, but the verified source does not establish an advance-booking window.",
                    details(
                            "A historic fortress and national museum beside the River Tiber.",
                            "Official museum admission",
                            List.of("Entry to Castel Sant'Angelo"),
                            "Official standard ticket",
                            "Use the named official ticket and bring matching identification."),
                    "https://direzionemuseiroma.cultura.gov.it/en/museo-nazionale-di-castel-santangelo/",
                    "https://portale.museiitaliani.it/"));

    List<OfficialBookingEvidence> all() {
        return EVIDENCE;
    }

    private static OfficialBookingEvidence evidence(
            String attractionId,
            String attractionName,
            OfficialBookingPolicy policy,
            String factualBasis,
            OfficialAttractionDetails details,
            String sourceUrl,
            String bookingUrl) {
        return new OfficialBookingEvidence(
                attractionId,
                attractionName,
                policy,
                factualBasis,
                details,
                URI.create(sourceUrl),
                URI.create(bookingUrl),
                CHECKED_ON);
    }

    private static OfficialAttractionDetails details(
            String overview,
            String ticketName,
            List<String> includedItems,
            String recommendationLabel,
            String recommendationReason) {
        return new OfficialAttractionDetails(
                overview,
                ticketName,
                includedItems,
                recommendationLabel,
                recommendationReason);
    }
}
