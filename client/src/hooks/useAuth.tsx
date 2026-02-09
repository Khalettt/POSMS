// hooks/useAuth.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type AppRole = 'manager' | 'cashier';

interface User {
  id: string;
  fullName: string; 
  email: string;
  role: AppRole;
}

interface AuthContextType {
  user: User | null;
  role: AppRole | null;
  isManager: boolean;
  isCashier: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role: string) => Promise<{ error: any }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem('pos_user');
      const token = localStorage.getItem('pos_token');

      if (savedUser && token) {
        try {
          // Waxaan halkan ku kalsoonahay xogta ku kaydsan browser-ka
          setUser(JSON.parse(savedUser));
        } catch (e) {
          localStorage.clear();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');

      // Hubi in xogta user-ka ay leedahay ROLE
      localStorage.setItem('pos_token', data.token);
      localStorage.setItem('pos_user', JSON.stringify(data.user));
      setUser(data.user);
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, role }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Signup failed');
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const signOut = () => {
    localStorage.removeItem('pos_token');
    localStorage.removeItem('pos_user');
    setUser(null);
    window.location.href = '/auth'; // Toos ugu celi login
  };

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role || null,
      isManager: user?.role === 'manager', // SHARDI MUHIIM AH
      isCashier: user?.role === 'cashier',
      isLoading,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};