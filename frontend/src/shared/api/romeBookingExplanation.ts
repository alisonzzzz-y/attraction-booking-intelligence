import { z } from 'zod'
import { apiUrl } from './apiUrl'
import { ApiRequestTimeoutError, fetchWithTimeout } from './fetchWithTimeout'

const explanationFactSchema = z.object({
  attractionId: z.string().min(1),
  attractionName: z.string().min(1),
  priority: z.enum(['BOOK_FIRST', 'BOOK_SOON', 'CAN_WAIT', 'UNKNOWN']),
  timing: z.string().min(1),
  officialPolicy: z.string().min(1),
  factualBasis: z.string().min(1),
  action: z.string().min(1),
  ruleVersion: z.string().min(1),
  checkedOn: z.iso.date(),
})

const romeBookingExplanationSchema = z.object({
  city: z.literal('Rome'),
  stayStartDate: z.iso.date(),
  stayEndDate: z.iso.date(),
  mode: z.enum(['MODEL', 'TEMPLATE_FALLBACK']),
  summary: z.string().min(1),
  facts: z.array(explanationFactSchema).min(1),
  boundaryNotice: z.string().min(1),
})

export type RomeBookingExplanation = z.infer<
  typeof romeBookingExplanationSchema
>

export class RomeBookingExplanationApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RomeBookingExplanationApiError'
  }
}

export async function fetchRomeBookingExplanation(
  stayStartDate: string,
  stayEndDate: string,
): Promise<RomeBookingExplanation> {
  const query = new URLSearchParams({ stayStartDate, stayEndDate })
  let response: Response
  try {
    response = await fetchWithTimeout(
      apiUrl(`/api/v1/rome/booking-explanation?${query}`),
      { headers: { Accept: 'application/json' } },
      20_000,
    )
  } catch (error) {
    if (error instanceof ApiRequestTimeoutError) {
      throw new RomeBookingExplanationApiError(
        'The booking explanation took too long to respond. The booking order is still available.',
      )
    }
    throw new RomeBookingExplanationApiError(
      'The booking explanation could not be reached. The booking order is still available.',
    )
  }

  if (!response.ok) {
    throw new RomeBookingExplanationApiError(
      'The booking explanation could not be generated. The booking order is still available.',
    )
  }

  const parsed = romeBookingExplanationSchema.safeParse(await response.json())
  if (!parsed.success) {
    throw new RomeBookingExplanationApiError(
      'The booking explanation response did not match the expected format.',
    )
  }
  return parsed.data
}
