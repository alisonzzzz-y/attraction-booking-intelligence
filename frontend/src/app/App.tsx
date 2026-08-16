import { Outlet } from 'react-router-dom'

export function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/">
          Attraction Booking Intelligence
        </a>
        <span className="phase-label">Project foundation</span>
      </header>

      <main>
        <Outlet />
      </main>

      <footer>
        Prices, availability, and booking rules will be added only after an
        authorised data source is available. There is no real ticket data yet.
      </footer>
    </div>
  )
}
