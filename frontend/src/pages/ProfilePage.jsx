import { useAuth } from '../context/AuthContext'
import SiteHeader from '../components/layout/SiteHeader.jsx'
import { Navigate } from 'react-router-dom'

export default function ProfilePage() {
  const { user, loading, logout } = useAuth()

  if (loading) return <div className="min-h-svh bg-cream text-ink flex items-center justify-center">Loading...</div>
  if (!user) return <Navigate to="/login" />

  return (
    <div className="min-h-svh bg-cream text-ink flex flex-col">
      <SiteHeader />
      <main className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <div className="rounded-2xl border border-accent bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-ink mb-6">Profile</h1>
          
          <div className="space-y-4">
            <div className="flex justify-between border-b border-accent pb-4">
              <span className="text-ink/65 font-medium">Username</span>
              <span className="text-ink font-semibold">{user.username}</span>
            </div>
            <div className="flex justify-between border-b border-accent pb-4">
              <span className="text-ink/65 font-medium">Email</span>
              <span className="text-ink font-semibold">{user.email}</span>
            </div>
            <div className="flex justify-between border-b border-accent pb-4">
              <span className="text-ink/65 font-medium">Rating</span>
              <span className="text-ink font-semibold">{user.rating}</span>
            </div>
            <div className="flex justify-between border-b border-accent pb-4">
              <span className="text-ink/65 font-medium">Role</span>
              <span className="text-ink font-semibold capitalize">{user.role?.toLowerCase()}</span>
            </div>
          </div>
          
          <div className="mt-8">
            <button
              onClick={logout}
              className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Log out
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
