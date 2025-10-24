import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, MessageSquare, FileText, Settings, MessageCircle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to log out");
    } else {
      toast.success("Logged out successfully");
      navigate("/auth");
    }
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: MessageSquare, label: "Comments", path: "/comments" },
    { icon: MessageCircle, label: "Messages", path: "/messages" },
    { icon: FileText, label: "AI Documents", path: "/documents" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border">
        <div className="p-6">
          <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
            SocialAI Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your social presence</p>
        </div>
        
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary font-medium shadow-glow"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="w-full justify-start gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
