import { Navigate, Outlet, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { Loader } from "../components/Loader.jsx";

export function ProtectedRoute() {
  const { isLoggedIn, authChecked, requiresMobileVerification, role } = useSelector(
    (state) => state.auth
  );
  const location = useLocation();

  if (!authChecked) return <Loader fullScreen />;

  if (requiresMobileVerification) {
    return <Navigate to="/verify-mobile" replace />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export function RoleProtectedRoute({ role }) {
  const {
    isLoggedIn,
    role: currentRole,
    authChecked,
    requiresMobileVerification,
  } = useSelector((state) => state.auth);

  if (!authChecked) return <Loader fullScreen />;

  if (requiresMobileVerification) {
    return <Navigate to="/verify-mobile" replace />;
  }

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (currentRole !== role) return <Navigate to="/" replace />;

  return <Outlet />;
}
