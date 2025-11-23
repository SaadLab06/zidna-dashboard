import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserManagementTab } from "@/components/superadmin/UserManagementTab";
import { RoleManagementTab } from "@/components/superadmin/RoleManagementTab";
import { AuditLogTab } from "@/components/superadmin/AuditLogTab";
import { AccountsManagementTab } from "@/components/superadmin/AccountsManagementTab";
import { PagePermissionsTab } from "@/components/superadmin/PagePermissionsTab";
import { Shield, Users, ScrollText, UserCog, Lock } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const SuperAdmin = () => {
  const { isSuperAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!roleLoading && !isSuperAdmin) {
      toast.error("Access denied: Superadmin privileges required");
      navigate("/");
    }
  }, [isSuperAdmin, roleLoading, navigate]);

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Superadmin Panel</h1>
          <p className="text-muted-foreground mt-2">Manage users, roles, and system configuration</p>
        </div>
      </div>

      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="accounts">
            <UserCog className="h-4 w-4 mr-2" />
            Accounts
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            User Roles
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Shield className="h-4 w-4 mr-2" />
            Role Management
          </TabsTrigger>
          <TabsTrigger value="pages">
            <Lock className="h-4 w-4 mr-2" />
            Page Permissions
          </TabsTrigger>
          <TabsTrigger value="audit">
            <ScrollText className="h-4 w-4 mr-2" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <AccountsManagementTab />
        </TabsContent>

        <TabsContent value="users">
          <UserManagementTab />
        </TabsContent>

        <TabsContent value="roles">
          <RoleManagementTab />
        </TabsContent>

        <TabsContent value="pages">
          <PagePermissionsTab />
        </TabsContent>

        <TabsContent value="audit">
          <AuditLogTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdmin;
