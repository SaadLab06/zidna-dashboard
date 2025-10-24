import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, RefreshCw, MessageSquare, Send, Edit, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { validateSearch } from "@/lib/validation";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";

const Comments = () => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const { isAdmin, isModerator } = useUserRole();

  useEffect(() => {
    fetchComments();

    const channel = supabase
      .channel('comments-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => {
        fetchComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [platformFilter, statusFilter, searchTerm]);

  const fetchComments = async () => {
    setLoading(true);
    let query = supabase.from('comments').select('*').order('created_at', { ascending: false });

    if (platformFilter !== 'all') {
      query = query.eq('platform', platformFilter);
    }

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    if (searchTerm) {
      const validation = validateSearch(searchTerm);
      if (!validation.success) {
        toast.error(validation.error);
        setLoading(false);
        return;
      }
      query = query.or(`user_name.ilike.%${validation.data}%,message.ilike.%${validation.data}%`);
    }

    const { data, error } = await query;

    if (!error && data) {
      setComments(data);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'replied':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPlatformColor = (platform: string) => {
    return platform === 'instagram' 
      ? 'bg-[#E1306C]/10 text-[#E1306C] border-[#E1306C]/20'
      : 'bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/20';
  };

  const toggleSelection = (id: string) => {
    setSelectedComments(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedComments.length === comments.length) {
      setSelectedComments([]);
    } else {
      setSelectedComments(comments.map(c => c.id));
    }
  };

  const handleDeleteComment = async (id: string) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (!error) {
      toast.success("Comment deleted successfully");
      setCommentToDelete(null);
      setDeleteDialogOpen(false);
      fetchComments();
    } else {
      toast.error("Failed to delete comment");
    }
  };

  const handleBulkDelete = async () => {
    for (const id of selectedComments) {
      await handleDeleteComment(id);
    }
    setSelectedComments([]);
  };

  const handleSendReply = (comment: any) => {
    toast.info("Reply functionality will be connected to webhook");
  };

  const handleEditReply = (comment: any) => {
    toast.info("Edit reply functionality will be connected to webhook");
  };

  const canModify = isAdmin || isModerator;

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Comments</h1>
          <p className="text-muted-foreground mt-2">Manage and respond to comments across platforms</p>
        </div>
        <Button onClick={fetchComments} variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 border-0 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by user or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              maxLength={200}
            />
          </div>
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="replied">Replied</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Comments Table */}
      <Card className="border-0 shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-6">
            <p className="text-center text-muted-foreground">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="p-12">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No comments found</h3>
              <p className="text-muted-foreground">
                {searchTerm || platformFilter !== 'all' || statusFilter !== 'all'
                  ? "Try adjusting your filters"
                  : "Comments will appear here once they're received"}
              </p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {canModify && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedComments.length === comments.length && comments.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                )}
                <TableHead>User</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
                {canModify && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {comments.map((comment) => (
                <TableRow key={comment.id}>
                  {canModify && (
                    <TableCell>
                      <Checkbox
                        checked={selectedComments.includes(comment.id)}
                        onCheckedChange={() => toggleSelection(comment.id)}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">
                    {comment.user_name || 'Unknown User'}
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="line-clamp-2">{comment.message}</p>
                    {comment.ai_reply && (
                      <p className="text-xs text-muted-foreground mt-1">
                        AI Reply: {comment.ai_reply.slice(0, 50)}...
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getPlatformColor(comment.platform)}>
                      {comment.platform}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(comment.status || 'pending')}>
                      {comment.status || 'pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {comment.created_at && formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </TableCell>
                  {canModify && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSendReply(comment)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Reply
                        </Button>
                        {comment.status === 'replied' && (
                          <Button
                            size="sm"
                            onClick={() => handleEditReply(comment)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        )}
                        {isAdmin && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setCommentToDelete(comment.id);
                              setDeleteDialogOpen(true);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Bulk Actions Bar */}
      {selectedComments.length > 0 && canModify && (
        <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-4 shadow-lg z-50">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <span className="font-medium">{selectedComments.length} item(s) selected</span>
            <div className="flex gap-3">
              <Button
                onClick={() => toast.info("Bulk reply will be connected to webhook")}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Send Replies
              </Button>
              {isAdmin && (
                <Button
                  onClick={handleBulkDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete Selected
                </Button>
              )}
              <Button
                onClick={() => setSelectedComments([])}
                variant="ghost"
                className="text-white hover:bg-blue-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the comment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => commentToDelete && handleDeleteComment(commentToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Comments;
