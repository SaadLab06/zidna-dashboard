import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, RefreshCw, MessageSquare, Send, Edit, Trash2 } from "lucide-react";
import { isAllowedWebhookUrl } from "@/lib/webhookValidation";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/context/AuthContext";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { validateSearch } from "@/lib/validation";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";

const Comments = () => {
  const { user, isSuperAdmin } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentComment, setCurrentComment] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [webhooks, setWebhooks] = useState<Record<string, string>>({});
  const { isAdmin, isModerator } = useUserRole();

  useEffect(() => {
    fetchWebhooks();
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

  const fetchWebhooks = async () => {
    try {
      const { data, error } = await supabase
        .from('webhooks_config')
        .select('name, endpoint');
      
      if (error) throw error;
      
      if (data) {
        const webhookMap: Record<string, string> = {};
        data.forEach(webhook => {
          if (webhook.name && webhook.endpoint) {
            webhookMap[webhook.name] = webhook.endpoint;
          }
        });
        setWebhooks(webhookMap);
      }
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      toast.error('Failed to load webhook configuration');
    }
  };

  const fetchComments = async () => {
    setLoading(true);
    if (!user) {
      setLoading(false);
      return;
    }

    let query = supabase
      .from('comments' as any)
      .select('*')
      .order('created_at', { ascending: false });

    // Only filter by owner_id if NOT superadmin
    if (!isSuperAdmin) {
      query = query.eq('owner_id', user.id);
    }

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

  const callWebhook = async (endpoint: string, payload: any) => {
    try {
      // Use webhook URL from database
      const webhookUrl = webhooks[endpoint];

      if (!webhookUrl) {
        toast.error(`Webhook ${endpoint} not configured in database`);
        return false;
      }

      // Validate webhook URL to prevent SSRF attacks
      const validation = isAllowedWebhookUrl(webhookUrl);
      if (!validation.valid) {
        toast.error(`Webhook security error: ${validation.error}`);
        return false;
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error('Webhook call failed');
      }

      return true;
    } catch (error) {
      // Don't log sensitive webhook details to console
      toast.error('Failed to call webhook');
      return false;
    }
  };

  const handleDeleteComment = async (id: string) => {
    const comment = comments.find(c => c.id === id);
    if (!comment) return;

    const success = await callWebhook('delete_comment', {
      comment_id: comment.comment_id,
      platform: comment.platform,
      owner_id: user?.id
    });

    if (success) {
      await supabase.from('comments').delete().eq('id', id);
      toast.success("Comment deleted successfully");
      setCommentToDelete(null);
      setDeleteDialogOpen(false);
      fetchComments();
    }
  };

  const handleBulkDelete = async () => {
    const selectedCommentData = comments.filter(c => selectedComments.includes(c.id));
    const ids = selectedCommentData.map(c => c.comment_id);
    const platform = selectedCommentData[0]?.platform;

    const success = await callWebhook('delete_comment', {
      ids,
      platform,
      owner_id: user?.id
    });

    if (success) {
      for (const id of selectedComments) {
        await supabase.from('comments').delete().eq('id', id);
      }
      toast.success("Comments deleted successfully");
      setSelectedComments([]);
      fetchComments();
    }
  };

  const handleSendReply = (comment: any) => {
    setCurrentComment(comment);
    setReplyText(comment.ai_reply || "");
    setReplyDialogOpen(true);
  };

  const handleConfirmReply = async () => {
    if (!currentComment || !replyText.trim()) return;

    const success = await callWebhook('comment_reply', {
      comment_id: currentComment.comment_id,
      reply_text: replyText,
      platform: currentComment.platform,
      owner_id: user?.id
    });

    if (success) {
      await supabase
        .from('comments')
        .update({ ai_reply: replyText })
        .eq('id', currentComment.id);
      
      toast.success("Reply sent successfully");
      setReplyDialogOpen(false);
      setReplyText("");
      setCurrentComment(null);
      fetchComments();
    }
  };

  const handleEditReply = (comment: any) => {
    setCurrentComment(comment);
    setReplyText(comment.ai_reply || "");
    setEditDialogOpen(true);
  };

  const handleConfirmEdit = async () => {
    if (!currentComment || !replyText.trim()) return;

    const success = await callWebhook('comment_reply', {
      comment_id: currentComment.comment_id,
      reply_text: replyText,
      platform: currentComment.platform,
      owner_id: user?.id
    });

    if (success) {
      await supabase
        .from('comments')
        .update({ ai_reply: replyText })
        .eq('id', currentComment.id);
      
      toast.success("Reply updated successfully");
      setEditDialogOpen(false);
      setReplyText("");
      setCurrentComment(null);
      fetchComments();
    }
  };

  const handleBulkSendReplies = async () => {
    const selectedCommentData = comments.filter(c => selectedComments.includes(c.id));
    
    // Build the new payload format with reply included
    const commentsPayload = selectedCommentData.map(comment => ({
      id: comment.comment_id,
      platform: comment.platform,
      reply: comment.ai_reply || ""
    }));

    const success = await callWebhook('comment_reply', {
      comments: commentsPayload,
      owner_id: user?.id
    });

    if (success) {
      toast.success("Replies sent successfully");
      setSelectedComments([]);
      fetchComments();
    }
  };

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

      {/* Bulk Actions Bar - Shows below search when items selected */}
      {selectedComments.length > 0 && (
        <Card className="p-4 border-0 shadow-lg bg-blue-600 text-white">
          <div className="flex items-center justify-between">
            <span className="font-medium">{selectedComments.length} item(s) selected</span>
            <div className="flex gap-3">
              <Button
                onClick={handleBulkSendReplies}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Send Replies
              </Button>
              <Button
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Selected
              </Button>
              <Button
                onClick={() => setSelectedComments([])}
                variant="ghost"
                className="text-white hover:bg-blue-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

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
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedComments.length === comments.length && comments.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Post Link</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comments.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedComments.includes(comment.id)}
                      onCheckedChange={() => toggleSelection(comment.id)}
                    />
                  </TableCell>
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
                    {comment.post_link ? (
                      <a 
                        href={comment.post_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        View Post
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-sm">N/A</span>
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>


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

      {/* Send Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Reply</DialogTitle>
            <DialogDescription>
              Compose a reply to {currentComment?.user_name}'s comment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Original Comment</Label>
              <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded">
                {currentComment?.message}
              </p>
            </div>
            <div>
              <Label>Your Reply</Label>
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                className="mt-2"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmReply} className="bg-blue-600 hover:bg-blue-700">
              <Send className="h-4 w-4 mr-2" />
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Reply Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Reply</DialogTitle>
            <DialogDescription>
              Update your reply to {currentComment?.user_name}'s comment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Original Comment</Label>
              <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded">
                {currentComment?.message}
              </p>
            </div>
            <div>
              <Label>Updated Reply</Label>
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                className="mt-2"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmEdit} className="bg-yellow-500 hover:bg-yellow-600">
              <Edit className="h-4 w-4 mr-2" />
              Update Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Comments;
