import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Search, MessageCircle, Send, Bot } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { validateSearch } from "@/lib/validation";
import { toast } from "sonner";

const Messages = () => {
  const [threads, setThreads] = useState<any[]>([]);
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    fetchThreads();

    const threadsChannel = supabase
      .channel('threads-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'threads' }, () => {
        fetchThreads();
      })
      .subscribe();

    const messagesChannel = supabase
      .channel('messages-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        if (selectedThread) {
          fetchMessages(selectedThread.thread_id);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(threadsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, []);

  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread.thread_id);
    }
  }, [selectedThread]);

  const fetchThreads = async () => {
    let query = supabase
      .from('threads')
      .select('*')
      .order('last_message_time', { ascending: false });

    if (searchTerm) {
      const validation = validateSearch(searchTerm);
      if (!validation.success) {
        toast.error(validation.error);
        return;
      }
      query = query.ilike('user_name', `%${validation.data}%`);
    }

    const { data, error } = await query;
    if (!error && data) {
      setThreads(data);
    }
  };

  const fetchMessages = async (threadId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchThreads();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Direct Messages</h1>
        <p className="text-muted-foreground mt-2">Manage conversations across platforms</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                maxLength={200}
              />
            </div>
          </div>
          <ScrollArea className="h-[calc(100%-80px)]">
            <div className="p-2">
              {threads.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                </div>
              ) : (
                threads.map((thread) => (
                  <div
                    key={thread.id}
                    onClick={() => setSelectedThread(thread)}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 mb-2 ${
                      selectedThread?.id === thread.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold">
                          {thread.user_name?.[0]?.toUpperCase() || '?'}
                        </span>
                      </div>
                       <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="font-medium truncate">{thread.user_name || 'Unknown'}</p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {thread.unread_count > 0 && (
                              <Badge variant="default" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                                {thread.unread_count}
                              </Badge>
                            )}
                            {thread.ai_control && (
                              <Badge className="bg-green-500 text-white whitespace-nowrap px-2 py-0.5">
                                AI Active
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {thread.last_message && thread.last_message.length > 50
                            ? `${thread.last_message.slice(0, 50)}...`
                            : thread.last_message}
                        </p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {thread.platform}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat Window */}
        <Card className="lg:col-span-2 border-0 shadow-lg flex flex-col">
          {selectedThread ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {selectedThread.user_name?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{selectedThread.user_name}</p>
                      <Badge variant="outline" className="text-xs">
                        {selectedThread.platform}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* AI Control Toggle */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">AI Agent:</span>
                    <Switch 
                      checked={selectedThread.ai_control}
                      onCheckedChange={async (checked) => {
                        const { error } = await supabase
                          .from('threads')
                          .update({ ai_control: checked })
                          .eq('id', selectedThread.id);
                        
                        if (!error) {
                          setSelectedThread({ ...selectedThread, ai_control: checked });
                          toast.success(checked ? "AI control enabled" : "AI control disabled");
                        } else {
                          toast.error("Failed to update AI control");
                        }
                      }}
                    />
                    <Badge className={selectedThread.ai_control ? "bg-green-500" : "bg-gray-400"}>
                      {selectedThread.ai_control ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id}>
                      <div
                        className={`flex ${message.direction === 'out' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.direction === 'out'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.created_at && formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      
                      {/* Show AI Auto-Reply */}
                      {message.direction === 'in' && message.ai_dm_reply && (
                        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 rounded-r-lg">
                          <div className="flex items-start gap-2">
                            <Bot className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-1">
                                AI {selectedThread.ai_control ? 'Auto-Reply (will be sent automatically)' : 'Reply'}
                              </p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {message.ai_dm_reply}
                              </p>
                              {selectedThread.ai_control && (
                                <div className="flex gap-2 mt-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={async () => {
                                      const { error } = await supabase
                                        .from('threads')
                                        .update({ ai_control: false })
                                        .eq('id', selectedThread.id);
                                      
                                      if (!error) {
                                        setSelectedThread({ ...selectedThread, ai_control: false });
                                        toast.success("Taken control from AI");
                                      }
                                    }}
                                    className="text-xs"
                                  >
                                    Take Control
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    maxLength={1000}
                    onKeyPress={async (e) => {
                      if (e.key === 'Enter' && newMessage.trim()) {
                        const messageText = newMessage.trim();
                        setNewMessage("");
                        
                        const { error } = await supabase
                          .from('messages')
                          .insert({
                            thread_id: selectedThread.thread_id,
                            platform: selectedThread.platform,
                            message: messageText,
                            direction: 'out',
                            sender_name: 'Admin'
                          });
                        
                        if (error) {
                          toast.error("Failed to send message");
                        }
                      }
                    }}
                  />
                  <Button 
                    size="icon"
                    onClick={async () => {
                      if (!newMessage.trim()) return;
                      
                      const messageText = newMessage.trim();
                      setNewMessage("");
                      
                      const { error } = await supabase
                        .from('messages')
                        .insert({
                          thread_id: selectedThread.thread_id,
                          platform: selectedThread.platform,
                          message: messageText,
                          direction: 'out',
                          sender_name: 'Admin'
                        });
                      
                      if (error) {
                        toast.error("Failed to send message");
                      }
                    }}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">Choose a thread to view messages</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Messages;
