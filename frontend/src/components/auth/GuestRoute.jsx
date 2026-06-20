import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-svh bg-cream text-ink flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
