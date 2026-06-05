import { Link, NavLink, useLocation } from 'react-router-dom'

export default function SiteHeader() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  const linkClass = ({ isActive }) =>
    [
      'text-sm font-medium transition-colors',
      isHome
        ? (isActive ? 'text-white' : 'text-white/80 hover:text-white')
        : (isActive ? 'text-primary' : 'text-ink/70 hover:text-ink'),
    ].join(' ')

  const headerClass = isHome
    ? 'w-full z-50 bg-transparent pt-4'
    : 'border-b border-accent/80 bg-cream/90 backdrop-blur-sm';

  const logoClass = isHome
    ? 'text-2xl font-bold tracking-tight text-white flex items-center gap-2'
    : 'text-2xl font-bold tracking-tight text-ink flex items-center gap-2';

  return (
    <header className={headerClass}>
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-8">
        <Link to="/" className={logoClass}>
          Pixel64
        </Link>
        <nav className="flex items-center gap-8">
          <NavLink to="/login" className={linkClass}>
            Sign in
          </NavLink>
          <NavLink
            to="/signup"
            className={`rounded px-5 py-2 text-sm font-medium transition-colors border ${isHome
              ? 'border-white text-white hover:bg-white hover:text-[#1A1A1A]'
              : 'border-primary bg-primary text-cream hover:bg-primary/90'
              }`}
          >
            Join
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
