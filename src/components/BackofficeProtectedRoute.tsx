import { Navigate } from "react-router-dom";
import { isBackofficeAuthenticated } from "../services/backoffice";

/**
 * Guards the back office area. A platform (clinic) session is NOT enough: the
 * user must hold a back office token, and the backend also enforces this on
 * every endpoint via `@Roles('backoffice')`.
 */
export function BackofficeProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isBackofficeAuthenticated()) {
    return <Navigate to="/backoffice/login" replace />;
  }
  return <>{children}</>;
}
