import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const doExchange = async () => {
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) {
          console.error("OAuth exchange failed", error);
          toast.error(error.message || "Authentication failed. Please try again.");
          navigate("/auth", { replace: true });
          return;
        }
        navigate("/", { replace: true });
      } catch (e) {
        console.error("OAuth exchange threw", e);
        toast.error("Authentication failed. Please try again.");
        navigate("/auth", { replace: true });
      }
    };
    doExchange();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-muted-foreground">Finishing sign-in…</div>
    </div>
  );
};

export default AuthCallback;
