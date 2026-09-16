import { describe, expect, it } from 'vitest'
import {
  bookingGuidance,
  romeCalendarDate,
} from '../features/attractions/bookingGuidance'
import type { RomeBookingPriority } from '../shared/api/romeBookingPriorities'

function attraction(
  id: string,
  policy: RomeBookingPriority['officialEvidence']['policy'] = 'TICKET_REQUIRED_TIMING_UNKNOWN',
): RomeBookingPriority {
  return {
    attractionId: id,
    attractionName: id,
    priority:
      policy === 'TIMED_RESERVATION_REQUIRED'
        ? 'BOOK_FIRST'
        : policy === 'FREE_GENERAL_ENTRY'
          ? 'CAN_WAIT'
          : 'UNKNOWN',
    confidence: 'LOW',
    timing: 'CHECK_OFFICIAL_SOURCE',
    action: 'Read official guidance',
    explanation: 'Test evidence',
    officialEvidence: {
      sourceType: 'OFFICIAL_OPERATOR',
      policy,
      factualBasis: 'Test evidence',
      sourceUrl: 'https://example.com/source',
      bookingUrl: 'https://example.com/tickets',
      checkedOn: '2026-09-16',
    },
    ruleVersion: 'test',
    calculatedAt: '2026-09-16T10:00:00Z',
  }
}

const now = new Date('2026-09-16T10:00:00Z')
const colosseum = attraction(
  'colosseum-archaeological-park',
  'TIMED_RESERVATION_REQUIRED',
)

describe('date-aware booking targets', () => {
  it('waits for the official Colosseum release window for a far-future visit', () => {
    const plan = bookingGuidance(colosseum, '2030-06-20', now)
    expect(plan.release?.date).toBe('2030-05-21')
    expect(plan.targetDate).toBe('2030-05-21')
    expect(plan.summary).toBe('Sales expected from 21 May 2030')
    expect(plan.label).toBe('Official release window')
    expect(plan.note).toContain('does not confirm current availability')
  })

  it.each([
    ['2026-10-17', '2026-09-17', 'Official release window'],
    ['2026-10-16', '2026-09-16', 'Booking target (estimate)'],
    ['2026-10-01', '2026-09-16', 'Booking target (estimate)'],
    ['2026-09-16', '2026-09-16', 'Booking target (estimate)'],
  ])(
    'handles the release boundary and never asks users to book in the past: %s',
    (visit, target, label) => {
      const plan = bookingGuidance(colosseum, visit, now)
      expect(plan.targetDate).toBe(target)
      expect(plan.label).toBe(label)
      expect(plan.note).toContain('Book only after your visit date is released')
    },
  )

  it.each([
    ['vatican-museums-sistine-chapel', '2027-04-21'],
    ['pantheon', '2027-06-13'],
    ['castel-sant-angelo', '2027-06-13'],
    ['borghese-gallery', '2027-05-21'],
    ['domus-aurea', '2027-06-06'],
    ['capitoline-museums', '2027-06-17'],
  ])(
    'gives %s an explicit estimated target that changes with travel dates',
    (id, target) => {
      const plan = bookingGuidance(attraction(id), '2027-06-20', now)
      expect(plan.targetDate).toBe(target)
      expect(plan.summary).toContain('Aim to book by')
      expect(plan.label).toBe('Booking target (estimate)')
      expect(plan.note).toContain('not a measured demand prediction')
      expect(
        bookingGuidance(attraction(id), '2027-07-20', now).targetDate,
      ).not.toBe(target)
    },
  )

  it('keeps an unverified release date distinct from an estimated purchase target', () => {
    const plan = bookingGuidance(
      attraction('vatican-museums-sistine-chapel'),
      '2027-06-20',
      now,
    )
    expect(plan.release).toBeUndefined()
    expect(plan.note).toContain(
      'An official release date has not been verified',
    )
    expect(plan.note).toContain('a missing date does not mean sold out')
  })

  it('uses the previous month for Pantheon, including across New Year', () => {
    const plan = bookingGuidance(attraction('pantheon'), '2027-01-03', now)
    expect(plan.release?.date).toBe('2026-12-15')
    expect(plan.release?.approximate).toBe(true)
    expect(plan.targetDate).toBe('2026-12-27')
    expect(plan.note).toContain('not a confirmed release day')
  })

  it('handles leap days as calendar days', () => {
    expect(bookingGuidance(colosseum, '2028-03-01', now).release?.date).toBe(
      '2028-01-31',
    )
  })

  it('uses Rome local dates across midnight and daylight saving changes', () => {
    expect(romeCalendarDate(new Date('2026-03-28T23:30:00Z'))).toBe(
      '2026-03-29',
    )
    expect(romeCalendarDate(new Date('2026-07-01T22:30:00Z'))).toBe(
      '2026-07-02',
    )
    expect(romeCalendarDate(new Date('2026-10-25T23:30:00Z'))).toBe(
      '2026-10-26',
    )
    expect(
      bookingGuidance(colosseum, '2026-04-28', new Date('2026-03-28T23:30:00Z'))
        .targetDate,
    ).toBe('2026-03-29')
  })

  it('preserves the original target when it has passed without claiming tickets are sold out', () => {
    const plan = bookingGuidance(attraction('pantheon'), '2026-09-20', now)
    expect(plan.originalTargetDate).toBe('2026-09-13')
    expect(plan.targetDate).toBe('2026-09-16')
    expect(plan.note).toContain('The original target was')
    expect(plan.note).toContain('This does not mean tickets are sold out')
  })

  it('does not invent a purchase deadline for free ordinary entry', () => {
    const plan = bookingGuidance(
      attraction('st-peters-basilica', 'FREE_GENERAL_ENTRY'),
      '2027-06-20',
      now,
    )
    expect(plan.targetDate).toBeUndefined()
    expect(plan.summary).toBe('Walk in for ordinary entry')
  })

  it('asks for new dates instead of suggesting a booking after the visit', () => {
    const plan = bookingGuidance(colosseum, '2026-09-15', now)
    expect(plan.targetDate).toBeUndefined()
    expect(plan.summary).toBe('Choose new travel dates')
  })
})
