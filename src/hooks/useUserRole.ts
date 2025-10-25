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
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        setRole(data?.role || 'user');
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
