import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Comments = () => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

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
      query = query.or(`user_name.ilike.%${searchTerm}%,message.ilike.%${searchTerm}%`);
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

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <Card className="p-6 border-0 shadow-lg">
            <p className="text-center text-muted-foreground">Loading comments...</p>
          </Card>
        ) : comments.length === 0 ? (
          <Card className="p-12 border-0 shadow-lg">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No comments found</h3>
              <p className="text-muted-foreground">
                {searchTerm || platformFilter !== 'all' || statusFilter !== 'all'
                  ? "Try adjusting your filters"
                  : "Comments will appear here once they're received"}
              </p>
            </div>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="p-6 border-0 shadow-lg hover:shadow-glow transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-lg">
                    {comment.user_name?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold">{comment.user_name || 'Unknown User'}</p>
                    <Badge variant="outline" className={getPlatformColor(comment.platform)}>
                      {comment.platform}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(comment.status || 'pending')}>
                      {comment.status || 'pending'}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {comment.created_at && formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mb-3">{comment.message}</p>
                  {comment.ai_reply && (
                    <div className="bg-muted/50 rounded-lg p-3 border border-border">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">AI Reply:</p>
                      <p className="text-sm">{comment.ai_reply}</p>
                    </div>
                  )}
                  {comment.post_link && (
                    <a 
                      href={comment.post_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline mt-2 inline-block"
                    >
                      View Original Post →
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;
