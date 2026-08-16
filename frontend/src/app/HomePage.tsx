import { useHealth } from '../shared/api/health'

export function HomePage() {
  const health = useHealth()

  return (
    <section className="hero" aria-labelledby="page-title">
      <p className="eyebrow">European attraction planning</p>
      <h1 id="page-title">Attraction Booking Intelligence</h1>
      <p className="intro">
        This application will help travellers decide which attractions need
        advance booking and when to check official or authorised ticket sources.
      </p>

      <div className="status-card" aria-live="polite">
        <span>Backend connection</span>
        {health.isPending && <strong>Checking</strong>}
        {health.isSuccess && <strong className="status-up">Connected</strong>}
        {health.isError && (
          <strong className="status-down">Not connected</strong>
        )}
      </div>

      <p className="scope-note">
        This version contains the project foundation only. Attraction search,
        prices, availability, and purchase links are not available.
      </p>
    </section>
  )
}
