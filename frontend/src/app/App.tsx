import { Link, NavLink, Outlet } from 'react-router-dom'

const navigationItems = [
  { label: 'Home', to: '/' },
  { label: 'Plan Rome', to: '/plan' },
  { label: 'Methodology', to: '/methodology' },
]

export function App() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <Link
          className="brand"
          to="/"
          aria-label="Attraction Booking Intelligence home"
        >
          <span className="brand-mark" aria-hidden="true">
            ABI
          </span>
          <span className="brand-name">Attraction Booking Intelligence</span>
        </Link>

        <nav className="site-nav" aria-label="Primary navigation">
          {navigationItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link-active' : 'nav-link'
              }
              end={item.to === '/'}
              key={item.to}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main id="main-content">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div>
          <strong>Attraction Booking Intelligence</strong>
          <p>An independent portfolio project, starting with Rome.</p>
        </div>
        <div className="footer-note">
          <p>
            Booking priority uses official sources. Third-party Sandbox evidence
            is separate and is not live availability.
          </p>
        </div>
      </footer>
    </div>
  )
}
