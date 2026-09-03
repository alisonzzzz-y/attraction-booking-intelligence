import { Link } from 'react-router-dom'

const decisionSteps = [
  {
    number: '01',
    title: 'Start with the trip',
    description:
      'Choose a city and travel date before looking at individual ticket options.',
  },
  {
    number: '02',
    title: 'Check authorised sources',
    description:
      'Keep each provider response tied to its source, retrieval time, and permitted use.',
  },
  {
    number: '03',
    title: 'Make uncertainty visible',
    description:
      'Separate unavailable, stale, and failed responses instead of turning them into a false answer.',
  },
]

const evidencePrinciples = [
  'Every ticket fact keeps its provider and retrieval time.',
  'A failed request is not treated as a sold-out attraction.',
  'AI may explain verified facts, but it cannot create them.',
]

export function HomePage() {
  return (
    <>
      <section className="hero page-section" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow">Rome first. Evidence first.</p>
          <h1 id="page-title">Plan the attractions that cannot wait.</h1>
          <p className="intro">
            A decision tool for independent travellers who need to know what to
            book early, what can wait, and what the available evidence actually
            supports.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/plan">
              Plan a Rome stay
            </Link>
            <Link className="button button-secondary" to="/methodology">
              See how the data works
            </Link>
          </div>
        </div>

        <aside className="preview-card" aria-label="Planned decision flow">
          <div className="preview-card-header">
            <span className="status-dot" aria-hidden="true" />
            <span>Planned decision flow</span>
          </div>
          <ol className="preview-list">
            <li>
              <span>Trip context</span>
              <strong>Rome · selected date</strong>
            </li>
            <li>
              <span>Evidence</span>
              <strong>Authorised provider responses</strong>
            </li>
            <li>
              <span>Decision support</span>
              <strong>Source, freshness, and clear unknowns</strong>
            </li>
          </ol>
          <p className="preview-disclaimer">
            Workflow preview only. No ticket data is shown.
          </p>
        </aside>
      </section>

      <section
        className="page-section decision-section"
        aria-labelledby="decision-title"
      >
        <div className="section-heading">
          <p className="eyebrow">A clearer booking decision</p>
          <h2 id="decision-title">
            One question, supported by visible evidence.
          </h2>
          <p>
            The product is designed around the decision a traveller needs to
            make, not around a wall of unexplained listings.
          </p>
        </div>
        <div className="step-grid">
          {decisionSteps.map((step) => (
            <article className="step-card" key={step.number}>
              <span className="step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="evidence-band" aria-labelledby="evidence-title">
        <div className="page-section evidence-layout">
          <div>
            <p className="eyebrow eyebrow-light">Data integrity</p>
            <h2 id="evidence-title">Built to keep facts and guesses apart.</h2>
          </div>
          <ul className="principle-list">
            {evidencePrinciples.map((principle) => (
              <li key={principle}>{principle}</li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="page-section build-section"
        id="build-status"
        aria-labelledby="build-title"
      >
        <div className="build-status-card">
          <div>
            <p className="eyebrow">Current build</p>
            <h2 id="build-title">
              The Rome planning flow is ready for local testing.
            </h2>
          </div>
          <span className="status-badge">Sandbox connected</span>
        </div>
        <div className="build-columns">
          <div>
            <h3>Available now</h3>
            <p>
              A tested full-stack foundation, a Rome date input flow, verified
              Google Places access, and an authorised Viator Sandbox adapter.
            </p>
          </div>
          <div>
            <h3>Not published yet</h3>
            <p>
              Live prices, real-time availability, and production booking links
              are not published yet. Booking explanations stay constrained to
              checked facts.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
