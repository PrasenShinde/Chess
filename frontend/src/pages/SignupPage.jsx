import { Link } from 'react-router-dom'
import SiteHeader from '../components/layout/SiteHeader.jsx'
import AuthPanel from '../components/auth/AuthPanel.jsx'

export default function SignupPage() {
  return (
    <div className="min-h-svh bg-cream text-ink">
      <SiteHeader />
      <AuthPanel
        title="Create your account"
        subtitle="Start playing in minutes. No clutter—just chess."
        footer={
          <p className="text-center text-sm text-ink/65">
            Already registered?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Log in
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
            <label htmlFor="signup-name" className="text-sm font-medium text-ink">
              Display name
            </label>
            <input
              id="signup-name"
              name="displayName"
              type="text"
              autoComplete="name"
              required
              className="w-full rounded-lg border border-accent bg-cream px-3 py-2.5 text-ink outline-none ring-primary/30 transition-shadow placeholder:text-ink/40 focus:ring-2"
              placeholder="Alex"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="signup-email" className="text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="signup-email"
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
              htmlFor="signup-password"
              className="text-sm font-medium text-ink"
            >
              Password
            </label>
            <input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="w-full rounded-lg border border-accent bg-cream px-3 py-2.5 text-ink outline-none ring-primary/30 transition-shadow placeholder:text-ink/40 focus:ring-2"
              placeholder="At least 8 characters"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-cream transition-opacity hover:opacity-90"
          >
            Create account
          </button>
        </form>
      </AuthPanel>
    </div>
  )
}
