import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUserRole = () => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_roles' as any)
          .select('role')
          .eq('user_id', user.id);
        
        // Handle multiple roles - prioritize highest privilege
        if (data && data.length > 0) {
          const roles = data.map((r: any) => r.role);
          if (roles.includes('superadmin')) {
            setRole('superadmin');
          } else if (roles.includes('admin')) {
            setRole('admin');
          } else if (roles.includes('moderator')) {
            setRole('moderator');
          } else {
            setRole('user');
          }
        } else {
          setRole('user');
        }
      }
      setLoading(false);
    };
    checkRole();
  }, []);

  return { 
    role, 
    loading, 
    isAdmin: role === 'admin', 
    isModerator: role === 'moderator',
    isSuperAdmin: role === 'superadmin'
  };
};
