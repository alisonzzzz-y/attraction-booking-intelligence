import type { RomeBookingPriority } from '../../shared/api/romeBookingPriorities'

export const PLANNING_RULE_VERSION = 'rome-planning-targets-v1'

// Product planning buffers, not observed sell-out times or official deadlines.
// 产品规划缓冲天数，不是历史售罄预测或官方截止日期。
const targetDaysBeforeVisit: Record<string, number> = {
  'vatican-museums-sistine-chapel': 60,
  'borghese-gallery': 30,
  'domus-aurea': 14,
  pantheon: 7,
  'castel-sant-angelo': 7,
  'capitoline-museums': 3,
}

export type BookingGuidance = {
  summary: string
  note: string
  label: string
  targetDate?: string
  originalTargetDate?: string
  release?: {
    date: string
    approximate: boolean
    summary: string
    sourceUrl: string
    checkedOn: string
  }
}

export function romeCalendarDate(now: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Rome',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const part = (type: string) => parts.find((item) => item.type === type)!.value
  return `${part('year')}-${part('month')}-${part('day')}`
}

export function formatPlanningDate(date: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}

function shiftDays(date: string, days: number) {
  const result = new Date(`${date}T00:00:00Z`)
  result.setUTCDate(result.getUTCDate() + days)
  return result.toISOString().slice(0, 10)
}

function releaseFor(
  attractionId: string,
  visitDate: string,
): BookingGuidance['release'] {
  if (attractionId === 'colosseum-archaeological-park') {
    const date = shiftDays(visitDate, -30)
    return {
      date,
      approximate: false,
      summary: `Sales expected from ${formatPlanningDate(date)}`,
      sourceUrl: 'https://colosseo.it/en/visit/orari-e-biglietti/',
      checkedOn: '2026-09-16',
    }
  }
  if (attractionId === 'pantheon') {
    const previousMonth = new Date(`${visitDate.slice(0, 7)}-15T00:00:00Z`)
    previousMonth.setUTCMonth(previousMonth.getUTCMonth() - 1)
    const date = previousMonth.toISOString().slice(0, 10)
    return {
      date,
      approximate: true,
      summary: `Sales expected around ${formatPlanningDate(date)}`,
      sourceUrl: 'https://direzionemuseiroma.cultura.gov.it/pantheon/',
      checkedOn: '2026-09-16',
    }
  }
  return undefined
}

export function bookingGuidance(
  priority: RomeBookingPriority,
  stayStartDate: string,
  now = new Date(),
): BookingGuidance {
  const today = romeCalendarDate(now)
  if (stayStartDate < today) {
    return {
      summary: 'Choose new travel dates',
      label: 'Past travel dates',
      note: 'The first possible visit date has passed. Update your travel dates to calculate a new booking target.',
    }
  }

  if (priority.priority === 'CAN_WAIT') {
    const label = 'Ordinary visit'
    switch (priority.officialEvidence.policy) {
      case 'FREE_GENERAL_ENTRY':
        return {
          label,
          summary: 'Walk in for ordinary entry',
          note: 'Ordinary entry is free. Choose the optional paid reservation only if you want a guaranteed time and the included audio guide.',
        }
      case 'NO_ADVANCE_RESERVATION_REQUIRED':
        return {
          label,
          summary: 'A same-day visit is a practical option',
          note: 'The official policy says an ordinary visit does not require a reservation. You can decide on the day, but check opening conditions before travelling.',
        }
      case 'OPTIONAL_PAID_AREA':
        return {
          label,
          summary: 'Walk in for the free exterior view',
          note: 'The normal exterior view is free. Buy a separate ticket only if you want the enclosed inner area.',
        }
      default:
        return {
          label,
          summary: 'Plan this after higher-priority tickets',
          note: 'The official rule does not require advance booking for the ordinary visit described here. Recheck the official website before travelling.',
        }
    }
  }

  const release = releaseFor(priority.attractionId, stayStartDate)
  const leadDays =
    priority.attractionId === 'colosseum-archaeological-park'
      ? 30
      : (targetDaysBeforeVisit[priority.attractionId] ?? 14)
  const originalTargetDate = shiftDays(stayStartDate, -leadDays)
  const targetDate = [
    originalTargetDate,
    today,
    release?.date ?? originalTargetDate,
  ]
    .sort()
    .at(-1)!
  const anchor = `Based on a first possible visit on ${formatPlanningDate(stayStartDate)}. If you choose a later day in your stay, move the target accordingly. Dates use Rome time.`
  const caveat =
    'This is a planning target, not a sell-out forecast or an official deadline. Book only after your visit date is released; a missing date does not mean sold out.'
  const basis =
    priority.attractionId === 'colosseum-archaeological-park'
      ? 'The official standard ticket window opens 30 days before the visit. Aim to book on the opening date; the exact release time and special admission days must be checked with the operator.'
      : `ABI uses a ${leadDays}-day planning buffer for this attraction. This is a provisional estimate, not a measured demand prediction.`
  const releaseNote = release?.approximate
    ? 'The operator says tickets open in the middle of the previous month. The 15th is an approximate reminder, not a confirmed release day.'
    : !release
      ? 'An official release date has not been verified for this ticket.'
      : 'The published release window does not confirm current availability.'
  const missed =
    originalTargetDate < today
      ? `The original target was ${formatPlanningDate(originalTargetDate)}; check the official calendar now and book if your date is available. This does not mean tickets are sold out.`
      : ''

  return {
    summary:
      release && !release.approximate && release.date > today
        ? release.summary
        : `Aim to book by ${formatPlanningDate(targetDate)}`,
    label:
      release && !release.approximate && release.date > today
        ? 'Official release window'
        : 'Booking target (estimate)',
    note: [basis, releaseNote, missed, anchor, caveat]
      .filter(Boolean)
      .join(' '),
    targetDate,
    originalTargetDate,
    release,
  }
}
