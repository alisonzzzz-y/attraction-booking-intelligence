import { z } from 'zod'

const priceSchema = z.object({
  amount: z.number().nonnegative(),
  currency: z.string().length(3),
  kind: z.enum(['EXACT', 'FROM']),
})

const sourceSchema = z.object({
  provider: z.string().min(1),
  environment: z.string().min(1),
  retrievedAt: z.iso.datetime(),
  freshness: z.enum(['FRESH', 'STALE']),
  referenceUrl: z.url().nullable().optional(),
})

const attractionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  offeringType: z.enum([
    'TICKET_PRODUCT',
    'TICKET_WITH_AUDIO_GUIDE',
    'GUIDED_TOUR',
    'UNKNOWN',
  ]),
  availabilityStatus: z.enum([
    'UNKNOWN',
    'SCHEDULED',
    'UNAVAILABLE',
    'REQUEST_FAILED',
  ]),
  reservationRequirement: z.enum([
    'REQUIRED',
    'RECOMMENDED',
    'NOT_REQUIRED',
    'UNKNOWN',
  ]),
  prices: z.array(priceSchema),
  source: sourceSchema,
})

const providerErrorSchema = z.object({
  type: z.string().min(1),
  code: z.string().min(1),
  message: z.string().min(1),
  attractionIds: z.array(z.string()),
})

const romeAttractionsResponseSchema = z.object({
  city: z.literal('Rome'),
  provider: z.string().min(1),
  environment: z.enum(['SANDBOX', 'PRODUCTION']),
  partialFailure: z.boolean(),
  attractions: z.array(attractionSchema),
  errors: z.array(providerErrorSchema),
})

export type RomeAttraction = z.infer<typeof attractionSchema>
export type RomeAttractionsResponse = z.infer<
  typeof romeAttractionsResponseSchema
>

export class RomeAttractionsApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RomeAttractionsApiError'
  }
}

export async function fetchRomeAttractions(
  stayStartDate: string,
  stayEndDate: string,
): Promise<RomeAttractionsResponse> {
  const query = new URLSearchParams({ stayStartDate, stayEndDate })
  const response = await fetch(`/api/v1/rome/attractions?${query}`, {
    headers: { Accept: 'application/json' },
  })

  if (response.status === 503) {
    throw new RomeAttractionsApiError(
      'The authorised ticket provider is not configured.',
    )
  }

  if (!response.ok) {
    throw new RomeAttractionsApiError(
      'The attraction evidence service could not complete this request.',
    )
  }

  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new RomeAttractionsApiError(
      'The attraction evidence service is not available on this deployment.',
    )
  }

  const parsed = romeAttractionsResponseSchema.safeParse(await response.json())
  if (!parsed.success) {
    throw new RomeAttractionsApiError(
      'The attraction evidence response did not match the expected format.',
    )
  }

  return parsed.data
}
