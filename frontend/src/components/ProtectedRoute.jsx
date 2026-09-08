import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, requireRole }) {
  const { isAuthenticated, session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="py-32 text-center text-navy-900/40">Chargement…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  if (requireRole && session?.activeRole !== requireRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}