import { z } from 'zod'

const officialEvidenceSchema = z.object({
  sourceType: z.literal('OFFICIAL_OPERATOR'),
  policy: z.enum([
    'TIMED_RESERVATION_REQUIRED',
    'ADVANCE_BOOKING_RECOMMENDED',
    'NO_ADVANCE_RESERVATION_REQUIRED',
    'FREE_GENERAL_ENTRY',
    'OPTIONAL_PAID_AREA',
    'TICKET_REQUIRED_TIMING_UNKNOWN',
  ]),
  factualBasis: z.string().min(1),
  sourceUrl: z.url(),
  bookingUrl: z.url(),
  checkedOn: z.iso.date(),
})

const bookingPrioritySchema = z.object({
  attractionId: z.string().min(1),
  attractionName: z.string().min(1),
  priority: z.enum(['BOOK_FIRST', 'BOOK_SOON', 'CAN_WAIT', 'UNKNOWN']),
  confidence: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  timing: z.enum([
    'AS_SOON_AS_VISIT_DATE_IS_FIXED',
    'BEFORE_FINALISING_DAILY_PLAN',
    'AFTER_HIGHER_PRIORITY_TICKETS',
    'CHECK_OFFICIAL_SOURCE',
  ]),
  action: z.string().min(1),
  explanation: z.string().min(1),
  officialEvidence: officialEvidenceSchema,
  ruleVersion: z.string().min(1),
  calculatedAt: z.iso.datetime(),
})

const romeBookingPrioritiesResponseSchema = z.object({
  city: z.literal('Rome'),
  stayStartDate: z.iso.date(),
  stayEndDate: z.iso.date(),
  priorities: z.array(bookingPrioritySchema),
})

export type RomeBookingPriority = z.infer<typeof bookingPrioritySchema>
export type RomeBookingPrioritiesResponse = z.infer<
  typeof romeBookingPrioritiesResponseSchema
>

export class RomeBookingPrioritiesApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RomeBookingPrioritiesApiError'
  }
}

export async function fetchRomeBookingPriorities(
  stayStartDate: string,
  stayEndDate: string,
): Promise<RomeBookingPrioritiesResponse> {
  const query = new URLSearchParams({ stayStartDate, stayEndDate })
  const response = await fetch(`/api/v1/rome/booking-priorities?${query}`, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new RomeBookingPrioritiesApiError(
      'The booking priority service could not complete this request.',
    )
  }

  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new RomeBookingPrioritiesApiError(
      'The booking priority service is not available on this deployment.',
    )
  }

  const parsed = romeBookingPrioritiesResponseSchema.safeParse(
    await response.json(),
  )
  if (!parsed.success) {
    throw new RomeBookingPrioritiesApiError(
      'The booking priority response did not match the expected format.',
    )
  }

  return parsed.data
}
