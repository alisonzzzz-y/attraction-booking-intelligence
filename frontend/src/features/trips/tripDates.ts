import { z } from 'zod'

export const tripPlanSchema = z
  .object({
    city: z.literal('rome'),
    dateMode: z.enum(['exact', 'flexible']),
    stayStartDate: z.iso.date(),
    stayEndDate: z.iso.date(),
    travelMonth: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
      .optional(),
    tripLengthDays: z.number().int().min(1).max(31).optional(),
    lengthFlexDays: z.number().int().min(0).max(30).optional(),
  })
  .superRefine((trip, ctx) => {
    const days =
      (Date.parse(trip.stayEndDate) - Date.parse(trip.stayStartDate)) /
        86_400_000 +
      1
    if (!Number.isFinite(days) || days < 1 || days > 31) {
      ctx.addIssue({
        code: 'custom',
        message: 'Choose a stay of 1 to 31 days.',
      })
    }
    if (
      trip.dateMode === 'flexible' &&
      (!trip.travelMonth ||
        trip.tripLengthDays === undefined ||
        trip.lengthFlexDays === undefined ||
        trip.tripLengthDays + trip.lengthFlexDays > 31)
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Choose a valid flexible travel window.',
      })
    }
  })

export type TripPlan = z.infer<typeof tripPlanSchema>
export type TripDateMode = TripPlan['dateMode']

export function parseTripQuery(params: URLSearchParams) {
  const number = (key: string) => {
    const value = params.get(key)
    return value === null
      ? undefined
      : value.trim() === ''
        ? NaN
        : Number(value)
  }
  return tripPlanSchema.safeParse({
    city: params.get('city'),
    dateMode: params.get('dateMode') ?? 'exact',
    stayStartDate: params.get('stayStartDate'),
    stayEndDate: params.get('stayEndDate'),
    travelMonth: params.get('travelMonth') ?? undefined,
    tripLengthDays: number('tripLengthDays'),
    lengthFlexDays: number('lengthFlexDays'),
  })
}
