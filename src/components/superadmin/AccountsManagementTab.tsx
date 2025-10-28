import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Shield, Trash2, KeyRound, Edit, Calendar } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface UserAccount {
  id: string;
  email: string;
  created_at: string;
  role?: string;
}

export const AccountsManagementTab = () => {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<UserAccount | null>(null);
  const [newRole, setNewRole] = useState<string>("user");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      
      // Get all user roles
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      // Create a map of user_id to role
      const rolesMap = new Map(rolesData?.map(r => [r.user_id, r.role]) || []);
      
      // Get user activity to find all user IDs and get some info
      const { data: activityData } = await supabase
        .from('user_activity')
        .select('user_id, created_at')
        .order('created_at', { ascending: false });
      
      // Get unique user IDs from activity
      const uniqueUserIds = [...new Set(activityData?.map(a => a.user_id) || [])];
      
      // For now, we'll show user IDs. In production, you'd use an edge function to get emails from auth.users
      const accountsList: UserAccount[] = uniqueUserIds.map(userId => {
        const firstActivity = activityData?.find(a => a.user_id === userId);
        return {
          id: userId || '',
          email: `User ${userId?.substring(0, 8)}...`, // Placeholder - would need edge function for real emails
          created_at: firstActivity?.created_at || new Date().toISOString(),
          role: rolesMap.get(userId!) || 'user'
        };
      });
      
      setAccounts(accountsList);
    } catch (error: any) {
      console.error('Error loading accounts:', error);
      toast.error(error.message || "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  const filteredAccounts = accounts.filter(account =>
    account.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteAccount = async () => {
    if (!selectedAccount) return;
    
    try {
      // Delete user's role
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedAccount.id);
      
      if (roleError) throw roleError;

      // Note: Deleting from auth.users requires admin API or edge function
      // For now, we're just removing the role
      
      toast.success("User role removed successfully");
      setDeleteDialogOpen(false);
      setSelectedAccount(null);
      loadAccounts();
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error(error.message || "Failed to delete account");
    }
  };

  const handleChangeRole = async () => {
    if (!selectedAccount) return;
    
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: selectedAccount.id,
          role: newRole as any
        }, {
          onConflict: 'user_id,role'
        });
      
      if (error) throw error;

      toast.success("User role updated successfully");
      setRoleDialogOpen(false);
      setSelectedAccount(null);
      loadAccounts();
    } catch (error: any) {
      console.error('Error changing role:', error);
      toast.error(error.message || "Failed to change role");
    }
  };

  const handleResetPassword = () => {
    // Password reset would require edge function with admin privileges
    toast.info("Password reset requires admin API access. Use Supabase dashboard for now.");
    setPasswordDialogOpen(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'admin': return 'bg-warning/10 text-warning border-warning/20';
      case 'moderator': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <>
      <Card className="p-6 border-0 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Account Management</h3>
            <p className="text-sm text-muted-foreground">View and manage all registered accounts</p>
          </div>
          <Button onClick={loadAccounts} disabled={loading}>
            Refresh
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email or user ID..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading accounts...</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No accounts found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-mono text-xs">{account.id.substring(0, 12)}...</TableCell>
                      <TableCell>{account.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getRoleBadgeColor(account.role || 'user')}>
                          <Shield className="h-3 w-3 mr-1" />
                          {account.role || 'user'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDistanceToNow(new Date(account.created_at), { addSuffix: true })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAccount(account);
                              setNewRole(account.role || 'user');
                              setRoleDialogOpen(true);
                            }}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Change Role
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAccount(account);
                              setPasswordDialogOpen(true);
                            }}
                          >
                            <KeyRound className="h-3 w-3 mr-1" />
                            Reset Password
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedAccount(account);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the user's role. This action cannot be undone.
              <br /><br />
              <strong>User:</strong> {selectedAccount?.email}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Select a new role for {selectedAccount?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Superadmin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangeRole}>
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Reset password for {selectedAccount?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Note: Password reset requires admin API access. For now, use the Supabase dashboard to reset passwords.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword}>
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};