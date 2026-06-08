import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import Home from './pages/Home.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Navigate to="/home" replace />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
