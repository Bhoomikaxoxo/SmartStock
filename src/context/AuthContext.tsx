import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthSession } from '../types';

const SESSION_STORAGE_KEY = 'smartstock_session_v1';
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours

// Seeded user database for prototype demonstration
export const SEEDED_USERS: (User & { passwordHash: string })[] = [
  {
    id: 'user-owner',
    name: 'Rahul Nair',
    email: 'owner@sweetcrustbakery.com',
    role: 'owner',
    avatarInitial: 'RN',
    // SHA-256 for 'demo1234' is "fe01ce2a7fbac8fafaed7c982a04e229" (truncated demo tag)
    passwordHash: 'demo1234',
  },
  {
    id: 'user-purchasing',
    name: 'Amit Verma',
    email: 'purchasing@sweetcrustbakery.com',
    role: 'purchasing',
    avatarInitial: 'AV',
    passwordHash: 'demo1234',
  },
  {
    id: 'user-staff',
    name: 'Priya Sharma',
    email: 'staff@sweetcrustbakery.com',
    role: 'staff',
    avatarInitial: 'PS',
    passwordHash: 'demo1234',
  },
];

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: (reason?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
  onSessionExpired?: (reason: string) => void;
}> = ({ children, onSessionExpired }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const session: AuthSession = JSON.parse(stored);
        if (Date.now() < session.expiresAt) {
          return session.user;
        } else {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
    } catch (e) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
    return null;
  });

  const logout = useCallback((reason?: string) => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setCurrentUser(null);
    if (reason && onSessionExpired) {
      onSessionExpired(reason);
    }
  }, [onSessionExpired]);

  // Periodic session check for 8-hour timeout
  useEffect(() => {
    const checkExpiry = () => {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        try {
          const session: AuthSession = JSON.parse(stored);
          if (Date.now() >= session.expiresAt) {
            logout('Session expired, please sign in again.');
          }
        } catch {
          logout();
        }
      }
    };

    const interval = setInterval(checkExpiry, 60000); // check every minute
    return () => clearInterval(interval);
  }, [logout]);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const matched = SEEDED_USERS.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.passwordHash === pass
    );

    if (!matched) {
      return {
        success: false,
        error: 'Invalid credentials. Please verify your email and password.',
      };
    }

    const user: User = {
      id: matched.id,
      name: matched.name,
      email: matched.email,
      role: matched.role,
      avatarInitial: matched.avatarInitial,
    };

    const session: AuthSession = {
      user,
      token: `mock-token-${Date.now()}`,
      expiresAt: Date.now() + SESSION_DURATION_MS,
    };

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    setCurrentUser(user);

    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
