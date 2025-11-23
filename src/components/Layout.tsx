import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, MessageSquare, FileText, Settings, MessageCircle, LogOut, User, Shield, Folders } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
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
    const applyUser = async (user: any) => {
      if (user) {
        setUserEmail(user.email || "");
        // Get role from user metadata
        const role = user.user_metadata?.app_role || 'client';
        setUserRole(role);
      } else {
        setUserEmail("");
        setUserRole("client");
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      applyUser(session?.user ?? null);
    });

    supabase.auth.getUser().then(({ data: { user } }) => applyUser(user));
    return () => subscription.unsubscribe();
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
    icon: Folders,
    label: "My Pages",
    path: "/pages"
  }, {
    icon: FileText,
    label: "AI Documents",
    path: "/documents"
  }, {
    icon: Settings,
    label: "Settings",
    path: "/settings"
  }];

  // Add SuperAdmin link if user is super_admin
  const allNavItems = isSuperAdmin 
    ? [...navItems, {
        icon: Shield,
        label: "SuperAdmin",
        path: "/superadmin"
      }]
    : navItems;
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarGroup>
              <div className="p-6 group-data-[collapsible=icon]:hidden">
                <h1 className="text-2xl font-bold text-slate-50">
                  Zidna Social Hub
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your social presence
                </p>
              </div>
            </SidebarGroup>
            
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {allNavItems.map(item => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link to={item.path}>
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout}>
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Top Navbar */}
          <div className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <span className="text-sm text-muted-foreground">Logged in as:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{userEmail}</span>
                {userRole && (
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full font-medium",
                    userRole === 'super_admin' && "bg-destructive/10 text-destructive border border-destructive/20",
                    userRole === 'admin' && "bg-warning/10 text-warning border border-warning/20",
                    userRole === 'moderator' && "bg-blue-500/10 text-blue-600 border border-blue-500/20",
                    userRole === 'client' && "bg-muted text-muted-foreground border border-border"
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
      </div>
    </SidebarProvider>
  );
};
export default Layout;