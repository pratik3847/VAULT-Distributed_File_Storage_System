import { Navigate, useLocation } from "react-router-dom";

import useAuth from "../hooks/useAuth";

function ProtectedRoute({ children }) {
  const { isAuthenticated, authReady } = useAuth();
  const location = useLocation();

  if (!authReady) {
    return <div className="auth-page">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;