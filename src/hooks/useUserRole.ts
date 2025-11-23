import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUserRole = () => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Get role from user metadata
        const userRole = user.user_metadata?.app_role || 'client';
        setRole(userRole);
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
    isSuperAdmin: role === 'super_admin'
  };
};
