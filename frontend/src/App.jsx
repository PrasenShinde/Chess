import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import Home from './pages/Home.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import Play from './pages/Play.jsx'
import PlayGame from './pages/PlayGame.jsx'
import LearnPage from './pages/LearnPage.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import GuestRoute from './components/auth/GuestRoute.jsx'

function NotFound() {
  return (
    <div className="min-h-svh bg-cream text-ink flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="mt-3 text-ink/70">The page you requested does not exist.</p>
        <a href="/" className="mt-6 inline-block text-primary font-medium hover:underline">
          Back to home
        </a>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/dashboard" element={<Navigate to="/home" replace />} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/play" element={<ProtectedRoute><Play /></ProtectedRoute>} />
        <Route path="/playing/:roomId" element={<ProtectedRoute><PlayGame /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
