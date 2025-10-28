import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, MessageSquare, FileText, Settings, MessageCircle, LogOut, User, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
interface LayoutProps {
  children: ReactNode;
}
const Layout = ({
  children
}: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("user");
  const { isSuperAdmin, isAdmin, isModerator } = useUserRole();
  
  useEffect(() => {
    const getUser = async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        
        // Get user's role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        if (roleData) {
          setUserRole(roleData.role);
        }
      }
    };
    getUser();
  }, []);
  const handleLogout = async () => {
    const {
      error
    } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to log out");
    } else {
      toast.success("Logged out successfully");
      navigate("/auth");
    }
  };
  const navItems = [{
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/"
  }, {
    icon: MessageSquare,
    label: "Comments",
    path: "/comments"
  }, {
    icon: MessageCircle,
    label: "Messages",
    path: "/messages"
  }, {
    icon: FileText,
    label: "AI Documents",
    path: "/documents"
  }, {
    icon: Settings,
    label: "Settings",
    path: "/settings"
  }];

  // Add SuperAdmin link if user is superadmin
  const allNavItems = isSuperAdmin 
    ? [...navItems, {
        icon: Shield,
        label: "SuperAdmin",
        path: "/superadmin"
      }]
    : navItems;
  return <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-slate-50">Zidna Social Hub</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your social presence</p>
        </div>
        
        <nav className="px-3 space-y-1 flex-1">
          {allNavItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return <Link key={item.path} to={item.path} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200", isActive ? "bg-sidebar-accent text-sidebar-primary font-medium shadow-glow" : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground")}>
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>;
        })}
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground w-full text-left"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Navbar */}
        <div className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Logged in as:</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{userEmail}</span>
              {userRole && (
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full font-medium",
                  userRole === 'superadmin' && "bg-destructive/10 text-destructive border border-destructive/20",
                  userRole === 'admin' && "bg-warning/10 text-warning border border-warning/20",
                  userRole === 'moderator' && "bg-blue-500/10 text-blue-600 border border-blue-500/20",
                  userRole === 'user' && "bg-muted text-muted-foreground border border-border"
                )}>
                  {userRole}
                </span>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="cursor-pointer">
                <AvatarFallback className="bg-gradient-primary text-white">
                  {userEmail.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-1">
                  <span>{userEmail}</span>
                  <span className="text-xs font-normal text-muted-foreground capitalize">
                    Role: {userRole}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>;
};
export default Layout;