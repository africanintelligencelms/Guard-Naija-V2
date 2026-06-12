import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api, getToken, setToken, UNAUTHORIZED_EVENT } from "../services/api";
import { UserRole, UserProfile } from "../types";

/** Minimal session identity (replaces the old firebase User object). */
export interface SessionUser {
  uid: string;
  email: string;
}

interface AuthContextType {
  user: SessionUser | null;
  userProfile: UserProfile | null;
  role: UserRole | null;
  login: (
    email: string,
    password: string,
    expectedRole?: UserRole
  ) => Promise<void>;
  signup: (
    email: string,
    password: string,
    role: UserRole,
    additionalData?: Partial<UserProfile>
  ) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthResponse {
  token: string;
  profile: UserProfile;
}

const ROLE_NAMES: Record<UserRole, string> = {
  citizen: "Citizen",
  agency: "Agency",
  admin: "Admin",
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from stored token
  useEffect(() => {
    let cancelled = false;
    const restore = async () => {
      if (!getToken()) {
        setIsLoading(false);
        return;
      }
      try {
        const { profile } = await api.get<{ profile: UserProfile }>("/auth/me");
        if (!cancelled) setUserProfile(profile);
      } catch {
        // Offline with a stored token: keep the session optimistic rather
        // than logging the user out; a real 401 clears the token via event.
        if (!cancelled && !getToken()) setUserProfile(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    restore();

    const onUnauthorized = () => setUserProfile(null);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => {
      cancelled = true;
      window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    };
  }, []);

  const signup = async (
    email: string,
    password: string,
    role: UserRole,
    additionalData?: Partial<UserProfile>
  ) => {
    const { token, profile } = await api.post<AuthResponse>("/auth/register", {
      email,
      password,
      role,
      ...additionalData,
    });
    setToken(token);
    setUserProfile(profile);
  };

  const login = async (
    email: string,
    password: string,
    expectedRole?: UserRole
  ) => {
    const { token, profile } = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    if (expectedRole && profile.role !== expectedRole) {
      throw new Error(
        `This account is registered as ${ROLE_NAMES[profile.role]}. ` +
          `Please use the ${ROLE_NAMES[profile.role]} login portal.`
      );
    }
    setToken(token);
    setUserProfile(profile);
  };

  const logout = async () => {
    setToken(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user: userProfile
          ? { uid: userProfile.uid, email: userProfile.email }
          : null,
        userProfile,
        role: userProfile?.role || null,
        login,
        signup,
        logout,
        isAuthenticated: !!userProfile,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

// Export UserRole for backward compatibility
export type { UserRole };
