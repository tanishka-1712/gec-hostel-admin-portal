import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, Role } from '../types';
import { mockCurrentUser } from '../data/mockData';

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (adminId: string, password: string, role?: Role) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('gec_admin_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
    // Default logged in as Chief Warden for quick review, or null if strictly login required
    return mockCurrentUser;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('gec_admin_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('gec_admin_user');
    }
  }, [user]);

  const login = async (adminId: string, _password: string, role: Role = 'ADMIN'): Promise<{ success: boolean; error?: string }> => {
    // Artificial slight delay for realistic UI loading state
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (!adminId.trim()) {
      return { success: false, error: 'Please enter your Admin ID or Username.' };
    }

    let roleUser: AdminUser;

    if (role === 'PRINCIPAL') {
      roleUser = {
        id: adminId || 'PRIN-GEC-01',
        name: 'Dr. Pravat Kumar Subudhi',
        email: 'principal@gec.edu.in',
        role: 'PRINCIPAL',
        designation: 'Principal & Head of Institution',
        department: 'Executive Academic Council',
        phone: '+91 94370 99999',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
      };
    } else if (role === 'WARDEN') {
      roleUser = {
        id: adminId || 'WRD-GEC-05',
        name: 'Prof. K. C. Sahoo',
        email: 'warden.kalam@gec.edu.in',
        role: 'WARDEN',
        designation: 'Hostel Warden (Kalam & CV Raman Block)',
        department: 'Mechanical Engineering / Warden Office',
        phone: '+91 98612 11223',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      };
    } else {
      roleUser = {
        ...mockCurrentUser,
        id: adminId || mockCurrentUser.id
      };
    }

    setUser(roleUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (newRole: Role) => {
    if (!user) return;
    if (newRole === 'PRINCIPAL') {
      setUser({
        id: 'PRIN-GEC-01',
        name: 'Dr. Pravat Kumar Subudhi',
        email: 'principal@gec.edu.in',
        role: 'PRINCIPAL',
        designation: 'Principal & Executive Authority',
        department: 'Principal Secretariat',
        phone: '+91 94370 99999',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
      });
    } else if (newRole === 'WARDEN') {
      setUser({
        id: 'WRD-GEC-05',
        name: 'Prof. K. C. Sahoo',
        email: 'warden.kalam@gec.edu.in',
        role: 'WARDEN',
        designation: 'Hostel Warden (Boys Block A & B)',
        department: 'Hostel Council',
        phone: '+91 98612 11223',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      });
    } else {
      setUser(mockCurrentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole
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
