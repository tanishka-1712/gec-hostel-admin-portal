import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, Role } from '../types';
import { mockCurrentUser } from '../data/mockData';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (adminId: string, password: string, role?: Role) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Fallback user profiles (used when Supabase auth is not configured) ───────
const FALLBACK_USERS: Record<Role, AdminUser> = {
  PRINCIPAL: {
    id: 'PRIN-GEC-01',
    name: 'Dr. Pravat Kumar Subudhi',
    email: 'principal@gec.edu.in',
    role: 'PRINCIPAL',
    designation: 'Principal & Head of Institution',
    department: 'Executive Academic Council',
    phone: '+91 94370 99999',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
  WARDEN: {
    id: 'WRD-GEC-05',
    name: 'Prof. K. C. Sahoo',
    email: 'warden.kalam@gec.edu.in',
    role: 'WARDEN',
    designation: 'Hostel Warden (Kalam & CV Raman Block)',
    department: 'Mechanical Engineering / Warden Office',
    phone: '+91 98612 11223',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  ADMIN: mockCurrentUser,
  HOD: {
    ...mockCurrentUser,
    role: 'HOD',
    designation: 'Head of Department',
  },
};

// ─── Helper: build AdminUser from Supabase auth user + admin_users row ────────
function buildAdminUser(
  authUser: { id: string; email?: string | null },
  profile: Record<string, unknown> | null,
  fallbackRole: Role
): AdminUser {
  if (!profile) {
    // No profile row yet — use fallback
    return { ...FALLBACK_USERS[fallbackRole], id: authUser.id, email: authUser.email ?? '' };
  }
  return {
    id: (profile.id as string) ?? authUser.id,
    name: (profile.name as string) ?? '',
    email: (profile.email as string) ?? authUser.email ?? '',
    role: (profile.role as Role) ?? fallbackRole,
    designation: (profile.designation as string) ?? '',
    department: (profile.department as string) ?? '',
    phone: (profile.phone as string) ?? '',
    avatar: (profile.avatar_url as string | undefined) ?? undefined,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('gec_admin_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return mockCurrentUser;
  });

  // ── Sync with Supabase session on mount ──────────────────────────────────
  useEffect(() => {
    // Check if Supabase is configured
    const url = import.meta.env.VITE_SUPABASE_URL as string;
    if (!url || url.includes('your-project-id')) return; // Not configured yet

    // Restore session from Supabase
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setUser(buildAdminUser(session.user, profile, 'ADMIN'));
      }
    });

    // Listen for auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          return;
        }
        if (session?.user) {
          const { data: profile } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setUser(buildAdminUser(session.user, profile, 'ADMIN'));
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Persist user to localStorage (for dev / offline fallback) ────────────
  useEffect(() => {
    if (user) {
      localStorage.setItem('gec_admin_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('gec_admin_user');
    }
  }, [user]);

  // ── login ─────────────────────────────────────────────────────────────────
  const login = async (
    adminId: string,
    password: string,
    role: Role = 'ADMIN'
  ): Promise<{ success: boolean; error?: string }> => {
    if (!adminId.trim()) {
      return { success: false, error: 'Please enter your Admin ID or Username.' };
    }

    // Try Supabase auth first
    const supabaseConfigured =
      import.meta.env.VITE_SUPABASE_URL &&
      !(import.meta.env.VITE_SUPABASE_URL as string).includes('your-project-id');

    if (supabaseConfigured) {
      // adminId is treated as the email for Supabase auth
      const email = adminId.includes('@') ? adminId : `${adminId}@gec.edu.in`;
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        // Surface a friendly message
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          return { success: false, error: 'Incorrect email or password. Please try again.' };
        }
        return { success: false, error: error.message };
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', data.user.id)
          .single();
        setUser(buildAdminUser(data.user, profile, role));
        return { success: true };
      }
    }

    // ── Fallback: mock login (no Supabase configured or local dev) ──────────
    await new Promise((resolve) => setTimeout(resolve, 600));
    const fallbackUser: AdminUser = { ...FALLBACK_USERS[role], id: adminId || FALLBACK_USERS[role].id };
    setUser(fallbackUser);
    return { success: true };
  };

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    const supabaseConfigured =
      import.meta.env.VITE_SUPABASE_URL &&
      !(import.meta.env.VITE_SUPABASE_URL as string).includes('your-project-id');

    if (supabaseConfigured) {
      await supabase.auth.signOut();
      // onAuthStateChange will set user to null
    } else {
      setUser(null);
    }
  };

  // ── switchRole (dev helper, works in fallback mode) ───────────────────────
  const switchRole = (newRole: Role) => {
    if (!user) return;
    setUser({ ...FALLBACK_USERS[newRole] });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole,
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
