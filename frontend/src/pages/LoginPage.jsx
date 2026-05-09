import { Link } from 'react-router-dom'
import SiteHeader from '../components/layout/SiteHeader.jsx'
import AuthPanel from '../components/auth/AuthPanel.jsx'

export default function LoginPage() {
  return (
    <div className="min-h-svh bg-cream text-ink">
      <SiteHeader />
      <AuthPanel
        title="Welcome back"
        subtitle="Sign in to continue to your games."
        footer={
          <p className="text-center text-sm text-ink/65">
            No account?{' '}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        }
      >
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <div className="space-y-2">
            <label htmlFor="login-email" className="text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-accent bg-cream px-3 py-2.5 text-ink outline-none ring-primary/30 transition-shadow placeholder:text-ink/40 focus:ring-2"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="login-password"
              className="text-sm font-medium text-ink"
            >
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-accent bg-cream px-3 py-2.5 text-ink outline-none ring-primary/30 transition-shadow placeholder:text-ink/40 focus:ring-2"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-cream transition-opacity hover:opacity-90"
          >
            Log in
          </button>
        </form>
      </AuthPanel>
    </div>
  )
}
