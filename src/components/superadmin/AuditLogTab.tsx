import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface AdminAction {
  id: string;
  admin_id: string;
  action: string;
  target_user_id: string | null;
  details: any;
  created_at: string;
}

export const AuditLogTab = () => {
  const [actions, setActions] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuditLog();
  }, []);

  const loadAuditLog = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_actions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setActions(data || []);
    } catch (error: any) {
      console.error('Error loading audit log:', error);
      toast.error("Failed to load audit log");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 border-0 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Audit Log</h3>
          <p className="text-sm text-muted-foreground">Track all admin actions (last 50)</p>
        </div>
        <Button onClick={loadAuditLog} disabled={loading}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading audit log...</div>
      ) : actions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No admin actions recorded yet</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin ID</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target User ID</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actions.map((action) => (
                <TableRow key={action.id}>
                  <TableCell className="font-mono text-sm">{action.admin_id}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{action.action}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{action.target_user_id || 'N/A'}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {JSON.stringify(action.details)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(action.created_at), { addSuffix: true })}
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
