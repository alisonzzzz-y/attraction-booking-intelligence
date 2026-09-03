import { Link } from 'react-router-dom'

const factRequirements = [
  {
    title: 'Traceable source',
    description:
      'The provider, product reference, and retrieval time stay attached to every external fact.',
  },
  {
    title: 'Defined meaning',
    description:
      'Price and availability fields are shown only after their provider-specific meaning is verified.',
  },
  {
    title: 'Permitted use',
    description:
      'Caching, display, comparison, and attribution follow the terms granted to this project.',
  },
]

const plannedStates = [
  ['Verified', 'The authorised source returned a clear, current value.'],
  [
    'Unavailable',
    'The source explicitly states that the option is unavailable.',
  ],
  ['Unknown', 'The source does not provide enough information to answer.'],
  ['Stale', 'The last response is older than its permitted freshness window.'],
  ['Request failed', 'The provider could not be reached or returned an error.'],
]

export function MethodologyPage() {
  return (
    <>
      <section
        className="page-section page-intro"
        aria-labelledby="methodology-title"
      >
        <p className="eyebrow">Methodology</p>
        <h1 id="methodology-title">
          A ticket fact needs evidence, context, and a clock.
        </h1>
        <p className="intro">
          This project is being designed to explain what an authorised source
          returned without hiding uncertainty or filling gaps with generated
          text.
        </p>
      </section>

      <section
        className="page-section methodology-section"
        aria-labelledby="fact-title"
      >
        <div className="section-heading compact-heading">
          <p className="eyebrow">Evidence standard</p>
          <h2 id="fact-title">What will count as a publishable fact?</h2>
        </div>
        <div className="fact-grid">
          {factRequirements.map((requirement) => (
            <article className="fact-card" key={requirement.title}>
              <h3>{requirement.title}</h3>
              <p>{requirement.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="state-section" aria-labelledby="state-title">
        <div className="page-section state-layout">
          <div className="section-heading compact-heading">
            <p className="eyebrow">Planned state model</p>
            <h2 id="state-title">
              Unknown must remain different from sold out.
            </h2>
            <p>
              These states describe the planned product contract. They are not
              live ticket results in the current preview.
            </p>
          </div>
          <dl className="state-list">
            {plannedStates.map(([term, description]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        className="page-section boundary-section"
        aria-labelledby="boundary-title"
      >
        <div>
          <p className="eyebrow">AI boundary</p>
          <h2 id="boundary-title">Explanation comes after the facts.</h2>
        </div>
        <div>
          <p>
            AI can turn verified fields and deterministic booking rules into a
            clearer explanation. It will not generate prices, remaining
            tickets, cancellation rules, or booking priority facts.
          </p>
          <p>
            If a source fails, the interface should preserve the failure and any
            remaining results instead of producing a confident replacement.
          </p>
        </div>
      </section>

      <section
        className="page-section methodology-cta"
        aria-label="Current project status"
      >
        <div>
          <p className="eyebrow eyebrow-light">Current status</p>
          <h2>Foundation tested. Sandbox providers connected.</h2>
        </div>
        <Link className="button button-primary" to="/#build-status">
          Return to current build
        </Link>
      </section>
    </>
  )
}
