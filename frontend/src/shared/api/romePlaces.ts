import { z } from 'zod'

const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})

const photoAttributionSchema = z.object({
  displayName: z.string().min(1).nullable(),
  uri: z.url().nullable(),
  photoUri: z.url().nullable(),
})

const placePhotoSchema = z.object({
  reference: z.string().min(1),
  widthPx: z.number().int().positive().nullable(),
  heightPx: z.number().int().positive().nullable(),
  authorAttributions: z.array(photoAttributionSchema).default([]),
})

const placeSchema = z.object({
  attractionId: z.string().min(1),
  componentId: z.string().min(1),
  placeId: z.string().min(1),
  name: z.string().min(1),
  formattedAddress: z.string().min(1),
  location: locationSchema,
  googleMapsUri: z.url().nullable(),
  businessStatus: z.string().min(1).nullable(),
  photos: z.array(placePhotoSchema).default([]),
  retrievedAt: z.iso.datetime(),
})

const romePlacesResponseSchema = z.object({
  city: z.literal('Rome'),
  source: z.literal('google-places'),
  attractions: z.array(placeSchema),
})

export type RomePlacePhoto = z.infer<typeof placePhotoSchema>

// Static map references and older test fixtures predate the optional imagery
// enrichment. Treat an omitted field as an empty gallery while the API parser
// still normalises live responses to an array.
export type RomePlace = Omit<z.input<typeof placeSchema>, 'photos'> & {
  photos?: RomePlacePhoto[]
}

export type RomePlacesResponse = Omit<z.infer<typeof romePlacesResponseSchema>, 'attractions'> & {
  attractions: RomePlace[]
}

export class RomePlacesApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RomePlacesApiError'
  }
}

export async function fetchRomePlaces(): Promise<RomePlacesResponse> {
  const response = await fetch('/api/v1/rome/places', {
    headers: { Accept: 'application/json' },
  })

  if (response.status === 503) {
    throw new RomePlacesApiError(
      'The Google Places location provider is not configured.',
    )
  }

  if (!response.ok) {
    throw new RomePlacesApiError(
      'The location evidence service could not complete this request.',
    )
  }

  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new RomePlacesApiError(
      'The location evidence service is not available on this deployment.',
    )
  }

  const parsed = romePlacesResponseSchema.safeParse(await response.json())
  if (!parsed.success) {
    throw new RomePlacesApiError(
      'The location evidence response did not match the expected format.',
    )
  }

  return parsed.data
}
