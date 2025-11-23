import { useAuth } from "@/context/AuthContext";

// Backward compatibility wrapper around AuthContext
export const useUserRole = () => {
  const { globalRole, loading, isSuperAdmin, isAdmin, isModerator, hasSystemAccess } = useAuth();
  
  return { 
    role: globalRole, 
    loading, 
    isAdmin, 
    isModerator,
    isSuperAdmin,
    hasSystemAccess
  };
};
