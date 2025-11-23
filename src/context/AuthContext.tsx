import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type GlobalRole = 'super_admin' | 'admin' | 'moderator' | 'client';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  
  // Global role management
  globalRole: GlobalRole | null;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  hasSystemAccess: (feature: 'superadmin' | 'admin' | 'moderator') => boolean;
  
  // Auth actions
  signOut: () => Promise<void>;
  refreshGlobalRole: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [globalRole, setGlobalRole] = useState<GlobalRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Load role from user metadata
  const loadGlobalRole = (user: User | null) => {
    if (!user) {
      setGlobalRole(null);
      return;
    }
    const role = (user.user_metadata?.app_role || 'client') as GlobalRole;
    setGlobalRole(role);
  };

  // Initialize auth state
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      loadGlobalRole(data.session?.user ?? null);
      setLoading(false);
    };

    init();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session ?? null);
        setUser(session?.user ?? null);
        loadGlobalRole(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // System access helper
  const hasSystemAccess = (feature: 'superadmin' | 'admin' | 'moderator') => {
    switch (feature) {
      case 'superadmin':
        return globalRole === 'super_admin';
      case 'admin':
        return globalRole === 'super_admin' || globalRole === 'admin';
      case 'moderator':
        return globalRole === 'super_admin' || globalRole === 'admin' || globalRole === 'moderator';
      default:
        return false;
    }
  };

  // Logout
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setGlobalRole(null);
  };

  // Manual refresh (for when roles are updated externally)
  const refreshGlobalRole = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setUser(data.user);
      loadGlobalRole(data.user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        globalRole,
        isSuperAdmin: globalRole === 'super_admin',
        isAdmin: globalRole === 'admin',
        isModerator: globalRole === 'moderator',
        hasSystemAccess,
        signOut,
        refreshGlobalRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
