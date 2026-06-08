import { useAuth } from '../context/AuthContext'
import SiteHeader from '../components/layout/SiteHeader.jsx'
import { Navigate, Link } from 'react-router-dom'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) return <div className="min-h-svh bg-cream text-ink flex items-center justify-center">Loading...</div>
  if (!user) return <Navigate to="/login" />

  return (
    <div className="min-h-svh bg-cream text-ink flex flex-col">
      <SiteHeader />
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 flex-1">
        
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome back, {user.username}!</h1>
          <p className="text-ink/70 max-w-xl mx-auto">Ready for your next match? Let's get to the board and start playing.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Action Section */}
          <div className="col-span-1 md:col-span-2 rounded-2xl border border-accent bg-white p-8 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
            <h2 className="text-2xl font-semibold mb-6">Play Chess</h2>
            <Link 
              to="/play" 
              className="rounded-xl bg-primary px-12 py-4 text-xl font-bold text-cream transition hover:opacity-90 hover:scale-105 transform inline-block"
            >
              Start Game
            </Link>
            <div className="mt-8 flex gap-4 text-sm text-ink/65">
              <span>Play online</span>
              <span>•</span>
              <span>Play bots</span>
              <span>•</span>
              <span>Tournaments</span>
            </div>
          </div>

          {/* Dummy Stats Section */}
          <div className="col-span-1 flex flex-col gap-8">
            <div className="rounded-2xl border border-accent bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-4">Your Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-ink/65">Rating</span>
                  <span className="font-bold text-primary">{user.rating}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink/65">Wins</span>
                  <span className="font-bold text-green-600">42</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink/65">Draws</span>
                  <span className="font-bold text-gray-500">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-ink/65">Losses</span>
                  <span className="font-bold text-red-500">28</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-accent bg-white p-6 shadow-sm flex-1">
              <h3 className="font-semibold text-lg mb-4">Recent Games</h3>
              <div className="flex flex-col items-center justify-center h-32 text-ink/50 text-sm">
                No recent games found.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
