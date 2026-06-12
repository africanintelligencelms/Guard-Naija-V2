import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { AuthScreen } from "../../components/AuthScreen";
import { UserRole } from "../../types";

export const Splash: React.FC = () => (
  <div className="min-h-screen bg-surface flex flex-col items-center justify-center space-y-4">
    <div className="animate-spin text-primary">
      <Shield className="h-12 w-12" />
    </div>
    <p className="text-ink-secondary font-medium text-sm">
      Initializing Secure Environment...
    </p>
  </div>
);

/** Blocks the whole app behind auth: splash while loading, AuthScreen if logged out. */
export const AuthGate: React.FC = () => {
  const { role, isLoading } = useAuth();
  if (isLoading) return <Splash />;
  if (!role) return <AuthScreen />;
  return <Outlet />;
};

/** Home route for the current role. */
export const homeFor = (role: UserRole | null): string =>
  role === "admin" ? "/admin" : role === "agency" ? "/agency" : "/";

/** Redirects to the user's own area instead of erroring on role mismatch. */
export const RequireRole: React.FC<{ allow: UserRole }> = ({ allow }) => {
  const { role } = useAuth();
  if (role !== allow) return <Navigate to={homeFor(role)} replace />;
  return <Outlet />;
};
