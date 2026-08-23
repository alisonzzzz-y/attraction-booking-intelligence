import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

const MAX_STAY_DAYS = 14

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function PlanPage({
  today = formatDate(new Date()),
}: {
  today?: string
}) {
  const navigate = useNavigate()
  const [stayStartDate, setStayStartDate] = useState('')
  const [stayEndDate, setStayEndDate] = useState('')
  const [error, setError] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

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
        <div className="plan-search-grid">
          <div className="form-field">
            <label htmlFor="city">City</label>
            <select id="city" name="city" defaultValue="rome">
              <option value="rome">Rome, Italy</option>
            </select>
          </div>

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

          <button className="button button-primary" type="submit">
            Find Rome attractions
          </button>
        </div>

        <p className="form-helper">
          Rome is the only city supported in this MVP. Exact dates are used for
          the current ticket evidence check.
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
    </section>
  )
}
