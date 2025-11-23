import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, RefreshCw, Users } from "lucide-react";
import { toast } from "sonner";

interface PagePermission {
  id: string;
  userId: string;
  userEmail: string;
  pageId: string;
  pageName: string;
  roles: string[];
  isOwner: boolean;
  relationStatus: string;
  approvalStatus: string;
}

export const PagePermissionsTab = () => {
  const [permissions, setPermissions] = useState<PagePermission[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_pages_relations')
        .select(`
          id,
          user_id,
          page_id,
          user_roles,
          owner_id,
          relation_status,
          approval_status,
          facebook_pages!inner(page_name)
        `);

      if (error) throw error;

      const { data: usersData } = await supabase.auth.admin.listUsers();
      const usersMap = new Map<string, string>();
      if (usersData?.users) {
        usersData.users.forEach((u: any) => {
          if (u.id && u.email) {
            usersMap.set(u.id, u.email);
          }
        });
      }

      const permissionsData: PagePermission[] = (data || []).map((item: any) => ({
        id: item.id,
        userId: item.user_id,
        userEmail: usersMap.get(item.user_id) || 'Unknown',
        pageId: item.page_id,
        pageName: item.facebook_pages?.page_name || 'Unknown Page',
        roles: item.user_roles || [],
        isOwner: item.owner_id === item.user_id,
        relationStatus: item.relation_status,
        approvalStatus: item.approval_status
      }));

      setPermissions(permissionsData);
    } catch (error) {
      console.error('Error loading permissions:', error);
      toast.error('Failed to load page permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  const getRoleColor = (roles: string[]) => {
    if (roles.includes('admin')) return 'bg-destructive text-destructive-foreground';
    if (roles.includes('editor')) return 'bg-primary text-primary-foreground';
    if (roles.includes('moderator')) return 'bg-secondary text-secondary-foreground';
    return 'bg-muted text-muted-foreground';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'accepted':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'rejected':
      case 'banished':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Page Permissions
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage user access to Facebook pages
          </p>
        </div>
        <Button onClick={loadPermissions} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading permissions...</div>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Page</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead>Owner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No page permissions found
                  </TableCell>
                </TableRow>
              ) : (
                permissions.map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell className="font-mono text-sm">
                      {permission.userEmail}
                    </TableCell>
                    <TableCell>{permission.pageName}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {permission.roles.map((role) => (
                          <Badge key={role} className={getRoleColor(permission.roles)}>
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(permission.relationStatus)}>
                        {permission.relationStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(permission.approvalStatus)}>
                        {permission.approvalStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {permission.isOwner && (
                        <Shield className="h-4 w-4 text-primary" />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
};
