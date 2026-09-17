import { z } from 'zod'
import { apiUrl } from './apiUrl'
import { ApiRequestTimeoutError, fetchWithTimeout } from './fetchWithTimeout'
import type { TripPlan } from '../../features/trips/tripDates'

const TRIP_REQUEST_TIMEOUT_MS = 12_000

const tripResponseSchema = z.object({
  id: z.string().min(1),
  city: z.string().refine((city) => city.trim().toLowerCase() === 'rome'),
  stayStartDate: z.iso.date(),
  stayEndDate: z.iso.date(),
  dateMode: z.enum(['EXACT', 'FLEXIBLE']),
  travelMonth: z.string().optional().nullable(),
  tripLengthDays: z.number().int().positive().optional().nullable(),
  lengthFlexDays: z.number().int().nonnegative().optional().nullable(),
  attractionIds: z.array(z.string().min(1)).max(50),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export type SavedTrip = Omit<
  z.infer<typeof tripResponseSchema>,
  'city' | 'dateMode'
> & { city: 'rome'; dateMode: TripPlan['dateMode'] }

export class TripApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TripApiError'
  }
}

function tripPayload(tripPlan: TripPlan, attractionIds: string[]) {
  return {
    ...tripPlan,
    attractionIds: [...new Set(attractionIds)],
    dateMode: tripPlan.dateMode.toUpperCase(),
  }
}

async function parseTripResponse(response: Response) {
  if (!response.ok) {
    throw new TripApiError(
      response.status === 404
        ? 'This saved trip could not be found.'
        : 'The trip could not be saved. Please try again.',
    )
  }

  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new TripApiError(
      'The trip service is not available on this deployment.',
    )
  }

  const parsed = tripResponseSchema.safeParse(await response.json())
  if (!parsed.success) {
    throw new TripApiError(
      'The trip response did not match the expected format.',
    )
  }

  return {
    ...parsed.data,
    city: 'rome' as const,
    dateMode: parsed.data.dateMode.toLowerCase() as TripPlan['dateMode'],
  }
}

async function requestTrip(path: string, init?: RequestInit) {
  try {
    return await fetchWithTimeout(
      apiUrl(path),
      { ...init, headers: { Accept: 'application/json', ...init?.headers } },
      TRIP_REQUEST_TIMEOUT_MS,
    )
  } catch (error) {
    if (error instanceof ApiRequestTimeoutError) {
      throw new TripApiError('The trip service took too long to respond.')
    }

    throw new TripApiError(
      'The trip service could not be reached. Please try again.',
    )
  }
}

export async function fetchTrip(tripId: string): Promise<SavedTrip> {
  return parseTripResponse(await requestTrip(`/api/v1/trips/${tripId}`))
}

export async function createTrip(
  tripPlan: TripPlan,
  attractionIds: string[],
): Promise<SavedTrip> {
  return parseTripResponse(
    await requestTrip('/api/v1/trips', {
      body: JSON.stringify(tripPayload(tripPlan, attractionIds)),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    }),
  )
}

export async function replaceTrip(
  tripId: string,
  tripPlan: TripPlan,
  attractionIds: string[],
): Promise<SavedTrip> {
  return parseTripResponse(
    await requestTrip(`/api/v1/trips/${tripId}`, {
      body: JSON.stringify(tripPayload(tripPlan, attractionIds)),
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
    }),
  )
}
