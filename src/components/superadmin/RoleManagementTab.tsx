import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield } from "lucide-react";
import { toast } from "sonner";

interface UserRole {
  id: string;
  user_id: string;
  role: string;
}

export const RoleManagementTab = () => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserRoles();
  }, []);

  const loadUserRoles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUserRoles(data || []);
    } catch (error: any) {
      console.error('Error loading roles:', error);
      toast.error("Failed to load user roles");
    } finally {
      setLoading(false);
    }
  };

  const logAdminAction = async (action: string, targetUserId: string, details: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('admin_actions').insert({
        admin_id: user.id,
        action,
        target_user_id: targetUserId,
        details
      });
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({ 
          user_id: userId, 
          role: newRole as 'user' | 'admin' | 'moderator' | 'superadmin'
        });

      if (error) throw error;

      await logAdminAction('role_update', userId, { new_role: newRole });
      toast.success("Role updated successfully");
      loadUserRoles();
    } catch (error: any) {
      toast.error("Failed to update role");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-destructive';
      case 'admin': return 'bg-warning';
      case 'moderator': return 'bg-info';
      default: return 'bg-muted';
    }
  };

  return (
    <Card className="p-6 border-0 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Role Management</h3>
          <p className="text-sm text-muted-foreground">Assign and modify user roles</p>
        </div>
        <Button onClick={loadUserRoles} disabled={loading}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading roles...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead>Change Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userRoles.map((userRole) => (
                <TableRow key={userRole.id}>
                  <TableCell className="font-mono text-sm">{userRole.user_id}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(userRole.role)}>
                      <Shield className="h-3 w-3 mr-1" />
                      {userRole.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={userRole.role}
                      onValueChange={(value) => updateUserRole(userRole.user_id, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="superadmin">Superadmin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
};
