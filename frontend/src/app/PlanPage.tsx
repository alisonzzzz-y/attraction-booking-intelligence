import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  buildSavedTripUrl,
  loadSavedTrip,
  type TripDateMode,
} from '../features/trips/localTripStorage'

const MAX_STAY_DAYS = 14
const FLEXIBLE_MONTH_COUNT = 8
const FLEXIBLE_TRIP_LENGTHS = [3, 5, 7, 10] as const
const FLEXIBLE_LENGTH_OPTIONS = [0, 1, 2] as const

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function monthKey(date: Date) {
  return date.toISOString().slice(0, 7)
}

function flexibleMonths(today: string) {
  const [year, month] = today.split('-').map(Number)
  return Array.from({ length: FLEXIBLE_MONTH_COUNT }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 1 + index, 1))
    return {
      value: monthKey(date),
      label: new Intl.DateTimeFormat('en-GB', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(date),
    }
  })
}

function flexibleEvidenceRange(
  travelMonth: string,
  tripLengthDays: number,
  lengthFlexDays: number,
  today: string,
) {
  const monthStart = `${travelMonth}-01`
  const stayStartDate = monthStart < today ? today : monthStart
  const endDate = new Date(`${stayStartDate}T00:00:00Z`)
  endDate.setUTCDate(endDate.getUTCDate() + tripLengthDays + lengthFlexDays - 1)

  return { stayStartDate, stayEndDate: formatDate(endDate) }
}

function savedTripDateCopy(
  trip: NonNullable<ReturnType<typeof loadSavedTrip>>,
) {
  if (
    trip.dateMode === 'flexible' &&
    trip.travelMonth &&
    trip.tripLengthDays !== undefined &&
    trip.lengthFlexDays !== undefined
  ) {
    const month = new Intl.DateTimeFormat('en-GB', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${trip.travelMonth}-01T00:00:00Z`))
    const flexibility =
      trip.lengthFlexDays === 0
        ? 'exact length'
        : `±${trip.lengthFlexDays} day${trip.lengthFlexDays === 1 ? '' : 's'}`
    return `Around ${trip.tripLengthDays} days in ${month}, ${flexibility}`
  }

  return `${trip.stayStartDate} to ${trip.stayEndDate}`
}

export function PlanPage({
  today = formatDate(new Date()),
}: {
  today?: string
}) {
  const navigate = useNavigate()
  const [dateMode, setDateMode] = useState<TripDateMode>('exact')
  const [stayStartDate, setStayStartDate] = useState('')
  const [stayEndDate, setStayEndDate] = useState('')
  const availableFlexibleMonths = flexibleMonths(today)
  const [travelMonth, setTravelMonth] = useState(
    availableFlexibleMonths[0]?.value ?? today.slice(0, 7),
  )
  const [tripLengthDays, setTripLengthDays] = useState(5)
  const [lengthFlexDays, setLengthFlexDays] = useState(1)
  const [error, setError] = useState('')
  const [savedTrip] = useState(loadSavedTrip)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (dateMode === 'flexible') {
      if (!travelMonth) {
        setError('Choose the month when you expect to visit Rome.')
        return
      }

      const flexibleRange = flexibleEvidenceRange(
        travelMonth,
        tripLengthDays,
        lengthFlexDays,
        today,
      )
      const query = new URLSearchParams({
        city: 'rome',
        stayStartDate: flexibleRange.stayStartDate,
        stayEndDate: flexibleRange.stayEndDate,
        dateMode: 'flexible',
        travelMonth,
        tripLengthDays: String(tripLengthDays),
        lengthFlexDays: String(lengthFlexDays),
      })
      navigate(`/results?${query.toString()}`)
      return
    }

    if (!stayStartDate || !stayEndDate) {
      setError('Choose both your arrival and departure dates.')
      return
    }
    if (stayEndDate < stayStartDate) {
      setError('Departure must be on or after arrival.')
      return
    }

    const inclusiveDays =
      Math.round(
        (Date.parse(`${stayEndDate}T00:00:00Z`) -
          Date.parse(`${stayStartDate}T00:00:00Z`)) /
          86_400_000,
      ) + 1
    if (inclusiveDays > MAX_STAY_DAYS) {
      setError('Choose a Rome stay of 14 days or fewer.')
      return
    }

    const query = new URLSearchParams({
      city: 'rome',
      stayStartDate,
      stayEndDate,
    })
    navigate(`/results?${query.toString()}`)
  }

  return (
    <section className="page-section plan-section" aria-labelledby="plan-title">
      <div className="plan-copy">
        <h1 id="plan-title">Start with the days you will be in Rome.</h1>
        <p className="intro">
          You do not need to choose a day for every attraction yet. Give us your
          city stay, and the next step will organise the available booking
          evidence around it.
        </p>
      </div>

      <form className="plan-form" onSubmit={submit} noValidate>
        <fieldset className="date-mode-fieldset">
          <legend>How certain are your dates?</legend>
          <div className="date-mode-options">
            <label className={dateMode === 'exact' ? 'selected' : undefined}>
              <input
                checked={dateMode === 'exact'}
                name="dateMode"
                onChange={() => {
                  setDateMode('exact')
                  setError('')
                }}
                type="radio"
                value="exact"
              />
              <span>
                <strong>Exact dates</strong>
                <small>I know when I will arrive and leave.</small>
              </span>
            </label>
            <label className={dateMode === 'flexible' ? 'selected' : undefined}>
              <input
                checked={dateMode === 'flexible'}
                name="dateMode"
                onChange={() => {
                  setDateMode('flexible')
                  setError('')
                }}
                type="radio"
                value="flexible"
              />
              <span>
                <strong>Flexible window</strong>
                <small>
                  I know the month and roughly how long I will stay.
                </small>
              </span>
            </label>
          </div>
        </fieldset>

        <div
          className={`plan-search-grid${dateMode === 'flexible' ? ' plan-search-grid-flexible' : ''}`}
        >
          <div className="form-field">
            <label htmlFor="city">City</label>
            <select id="city" name="city" defaultValue="rome">
              <option value="rome">Rome, Italy</option>
            </select>
          </div>

          {dateMode === 'exact' ? (
            <div className="date-field-grid">
              <div className="form-field">
                <label htmlFor="stay-start-date">Arrival date</label>
                <input
                  id="stay-start-date"
                  min={today}
                  name="stayStartDate"
                  onChange={(event) => setStayStartDate(event.target.value)}
                  type="date"
                  value={stayStartDate}
                />
              </div>
              <div className="form-field">
                <label htmlFor="stay-end-date">Departure date</label>
                <input
                  id="stay-end-date"
                  min={stayStartDate || today}
                  name="stayEndDate"
                  onChange={(event) => setStayEndDate(event.target.value)}
                  type="date"
                  value={stayEndDate}
                />
              </div>
            </div>
          ) : (
            <div className="flexible-date-builder">
              <div className="form-field">
                <label htmlFor="travel-month">Travel month</label>
                <select
                  id="travel-month"
                  name="travelMonth"
                  onChange={(event) => setTravelMonth(event.target.value)}
                  value={travelMonth}
                >
                  {availableFlexibleMonths.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>

              <fieldset className="compact-choice-fieldset">
                <legend>Approximate trip length</legend>
                <div className="compact-choice-options">
                  {FLEXIBLE_TRIP_LENGTHS.map((days) => (
                    <label
                      className={
                        tripLengthDays === days ? 'selected' : undefined
                      }
                      key={days}
                    >
                      <input
                        checked={tripLengthDays === days}
                        name="tripLengthDays"
                        onChange={() => setTripLengthDays(days)}
                        type="radio"
                        value={days}
                      />
                      <span>{days} days</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="compact-choice-fieldset">
                <legend>Trip length can vary by</legend>
                <div className="compact-choice-options">
                  {FLEXIBLE_LENGTH_OPTIONS.map((days) => (
                    <label
                      className={
                        lengthFlexDays === days ? 'selected' : undefined
                      }
                      key={days}
                    >
                      <input
                        checked={lengthFlexDays === days}
                        name="lengthFlexDays"
                        onChange={() => setLengthFlexDays(days)}
                        type="radio"
                        value={days}
                      />
                      <span>
                        {days === 0
                          ? 'Exact length'
                          : `±${days} day${days === 1 ? '' : 's'}`}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          <button className="button button-primary" type="submit">
            Find Rome attractions
          </button>
        </div>

        <p className="form-helper">
          Rome is the only city supported in this MVP.{' '}
          {dateMode === 'flexible'
            ? 'Choose one likely month and an approximate stay length. The booking order uses the earliest realistic dates so it does not understate urgency.'
            : 'These dates define the current evidence check.'}
        </p>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <p className="form-disclaimer">
          Ticket integration currently uses an authorised Viator Sandbox key.
          Sandbox schedules are development evidence, not live inventory.
        </p>
      </form>

      {savedTrip ? (
        <aside className="saved-trip-resume" aria-label="Saved trip">
          <div>
            <p className="eyebrow">Saved on this device</p>
            <h2>Continue your Rome trip</h2>
            <p>
              {savedTripDateCopy(savedTrip)}
              {' · '}
              {savedTrip.attractionIds.length}{' '}
              {savedTrip.attractionIds.length === 1
                ? 'saved attraction'
                : 'saved attractions'}
            </p>
          </div>
          <Link
            className="button button-secondary"
            to={buildSavedTripUrl(savedTrip)}
          >
            Continue saved trip
          </Link>
        </aside>
      ) : null}
    </section>
  )
}
