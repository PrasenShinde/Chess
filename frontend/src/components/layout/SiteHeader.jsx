import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function SiteHeader() {
  const location = useLocation();
  const { user } = useAuth() || {}; // Use empty object fallback in case it's used outside provider
  const isHome = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  const linkClass = () =>
    [
      `rounded px-5 py-2 text-sm font-medium transition-colors border ${isHome
        ? 'border-white text-white hover:bg-white hover:text-[#1A1A1A]'
        : 'border-primary bg-primary text-cream hover:bg-primary/90'
      }`
    ].join(' ')

  const headerClass = isHome
    ? 'absolute top-0 left-0 w-full z-50 bg-transparent pt-4'
    : 'border-b border-accent/80 bg-cream/90 backdrop-blur-sm';

  const logoClass = isHome
    ? 'text-2xl font-bold tracking-tight text-white flex items-center gap-2'
    : 'text-2xl font-bold tracking-tight text-ink flex items-center gap-2';

  return (
    <header className={headerClass}>
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-8">
        <Link to={user ? "/home" : "/"} className={logoClass}>
          Pixel64
        </Link>
        <nav className="flex items-center gap-4">
          {!user && !isAuthPage && (
            <>
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
            </>
          )}
          {user && (
            <NavLink to="/profile" className={linkClass}>
              Profile
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}
