import { Link, NavLink } from 'react-router-dom'

const linkClass = ({ isActive }) =>
  [
    'text-sm font-medium transition-colors',
    isActive ? 'text-primary' : 'text-ink/70 hover:text-ink',
  ].join(' ')

export default function SiteHeader() {
  return (
    <header className="border-b border-accent/80 bg-cream/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
        <Link
          to="/"
          className="text-lg font-semibold tracking-tight text-ink"
        >
          Chess
        </Link>
        <nav className="flex items-center gap-6">
          <NavLink to="/login" className={linkClass}>
            Log in
          </NavLink>
          <NavLink
            to="/signup"
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-cream transition-opacity hover:opacity-90"
          >
            Sign up
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
