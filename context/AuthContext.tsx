
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'citizen' | 'agency' | 'admin';

interface AuthContextType {
  role: UserRole | null;
  login: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize role from local storage on mount
  useEffect(() => {
    const storedRole = localStorage.getItem('guard_nigeria_role');
    if (storedRole) {
      // Validate that the stored role is a valid UserRole
      if (['citizen', 'agency', 'admin'].includes(storedRole)) {
        setRole(storedRole as UserRole);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newRole: UserRole) => {
    setRole(newRole);
    localStorage.setItem('guard_nigeria_role', newRole);
  };

  const logout = () => {
    setRole(null);
    localStorage.removeItem('guard_nigeria_role');
  };

  return (
    <AuthContext.Provider value={{ role, login, logout, isAuthenticated: !!role, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
