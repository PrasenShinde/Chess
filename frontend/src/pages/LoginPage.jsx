import { useState } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import SiteHeader from '../components/layout/SiteHeader.jsx'
import AuthPanel from '../components/auth/AuthPanel.jsx'
import { API_URL } from '../services/api.js'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()

  const oauthError = searchParams.get('error')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      const redirectTo = location.state?.from?.pathname || '/home'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      if (err.message === 'Invalid credentials') {
        setError('Wrong email or password. Please try again.')
      } else {
        setError(err.message || 'Login failed. Please try again.')
      }
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`
  }

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
        <form className="space-y-5" onSubmit={handleLogin}>
          {(error || oauthError) && (
            <div className="text-red-500 text-sm text-center">
              {error || 'Google sign-in failed. Please try again.'}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="login-email" className="text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            <div className="relative">
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-accent bg-cream px-3 py-2.5 pr-10 text-ink outline-none ring-primary/30 transition-shadow placeholder:text-ink/40 focus:ring-2"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-ink/60 hover:text-ink transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-cream transition-opacity hover:opacity-90"
          >
            Log in
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-accent" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-cream px-2 text-ink/65">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full flex justify-center py-2.5 px-4 border border-accent rounded-lg shadow-sm bg-cream text-sm font-medium text-ink hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </AuthPanel>
    </div>
  )
}
