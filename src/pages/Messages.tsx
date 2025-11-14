import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Search, MessageCircle, Send, Bot, RefreshCw, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { validateSearch } from "@/lib/validation";
import { toast } from "sonner";
import { WEBHOOK_URLS, webhookRateLimiter } from "@/lib/webhookConfig";

const Messages = () => {
  const [threads, setThreads] = useState<any[]>([]);
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isCheckingMessages, setIsCheckingMessages] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchThreads();

    const threadsChannel = supabase
      .channel('threads-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'threads' }, () => {
        fetchThreads();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(threadsChannel);
    };
  }, []);

  // Separate effect for messages subscription that depends on selectedThread
  useEffect(() => {
    if (!selectedThread) return;

    const messagesChannel = supabase
      .channel(`messages-realtime-${selectedThread.thread_id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'messages',
        filter: `thread_id=eq.${selectedThread.thread_id}`
      }, () => {
        fetchMessages(selectedThread.thread_id);
        fetchThreads(); // Also update threads list when new message arrives
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [selectedThread]);

  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread.thread_id);
    }
  }, [selectedThread]);

  const fetchThreads = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if user is superadmin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();
    
    const isSuperAdmin = roleData?.role === 'superadmin';

    let query = supabase
      .from('threads' as any)
      .select('*')
      .order('last_message_time', { ascending: false });

    // Only filter by owner_id if NOT superadmin
    if (!isSuperAdmin) {
      query = query.eq('owner_id', user.id);
    }

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if user is superadmin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();
    
    const isSuperAdmin = roleData?.role === 'superadmin';

    let query = supabase
      .from('messages' as any)
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    // Only filter by owner_id if NOT superadmin
    if (!isSuperAdmin) {
      query = query.eq('owner_id', user.id);
    }

    const { data, error } = await query;

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

  const handleRefreshThreads = async () => {
    setIsRefreshing(true);
    try {
      await fetchThreads();
      toast.success("Conversations refreshed");
    } catch (error) {
      console.error('Error refreshing threads:', error);
      toast.error("Failed to refresh conversations");
    } finally {
      setIsRefreshing(false);
    }
  };

  const checkForNewMessages = async () => {
    // Rate limit check
    if (!webhookRateLimiter.canCall('check-messages')) {
      const remaining = Math.ceil(webhookRateLimiter.getRemainingTime('check-messages') / 1000);
      toast.error(`Please wait ${remaining} seconds before checking again`);
      return;
    }

    setIsCheckingMessages(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("User not authenticated");
        return;
      }

      // Get Instagram account ID
      const { data: instagramAccount, error: igError } = await supabase
        .from('instagram_accounts')
        .select('instagram_account_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (igError || !instagramAccount?.instagram_account_id) {
        toast.error("Instagram account not found");
        return;
      }

      // Make POST request to webhook using centralized config
      const response = await fetch(WEBHOOK_URLS.GET_ALL_MESSAGES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          instagram_account_id: instagramAccount.instagram_account_id
        }),
      });

      if (response.ok) {
        toast.success("Checking for new messages...");
        // Refresh threads after a short delay
        setTimeout(() => {
          fetchThreads();
        }, 2000);
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Webhook error:', errorText);
        toast.error("Failed to check for new messages");
      }
    } catch (error) {
      console.error('Error checking for new messages:', error);
      toast.error(error instanceof Error ? error.message : "Error checking for new messages");
    } finally {
      setIsCheckingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;
    
    const messageText = newMessage.trim();
    setNewMessage("");
    setIsSending(true);
    
    try {
      // Get the recipient_id from the last incoming message
      const lastIncomingMessage = messages.find(m => m.direction === 'in');
      if (!lastIncomingMessage?.sender_id) {
        toast.error("Cannot determine recipient ID");
        setNewMessage(messageText);
        return;
      }
      
      // Call the webhook first using centralized config
      const { data: { user } } = await supabase.auth.getUser();
      const webhookResponse = await fetch(WEBHOOK_URLS.DM_REPLY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient_id: lastIncomingMessage.recipient_id,
          sender_id: lastIncomingMessage.sender_id,
          ai_dm_reply: messageText,
          owner_id: user?.id,
          platform: selectedThread.platform
        }),
      });
      
      // Check if webhook returned 200 with the expected message
      if (webhookResponse.ok) {
        const responseText = await webhookResponse.text();
        if (responseText === "Message was sent successfully") {
          // Only now add message to database
          const { error } = await supabase
            .from('messages')
            .insert({
              thread_id: selectedThread.thread_id,
              platform: selectedThread.platform,
              message: messageText,
              direction: 'out',
              sender_name: 'Admin',
              sender_id: lastIncomingMessage.recipient_id,
              recipient_id: lastIncomingMessage.sender_id,
              owner_id: user?.id
            });
          
          if (error) {
            toast.error("Failed to save message to database");
            console.error('Database insert error:', error);
          } else {
            toast.success("Message sent successfully");
            fetchThreads();
          }
        } else {
          toast.error("Webhook returned unexpected response");
          setNewMessage(messageText);
        }
      } else {
        const errorText = await webhookResponse.text().catch(() => 'Unknown error');
        console.error('Webhook error:', errorText);
        toast.error("Webhook failed - message not sent");
        setNewMessage(messageText);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to send message");
      setNewMessage(messageText);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Direct Messages</h1>
        <p className="text-muted-foreground mt-2">Manage conversations across platforms</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)] min-h-0">
        {/* Conversations List */}
        <Card className="border-0 shadow-lg overflow-hidden h-full min-h-0">
          <div className="p-4 border-b border-border space-y-3">
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
            <div className="flex gap-2">
              <Button
                onClick={handleRefreshThreads}
                disabled={isRefreshing}
                className="flex-1"
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={checkForNewMessages}
                disabled={isCheckingMessages}
                className="flex-1"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Check New
              </Button>
            </div>
          </div>
          <ScrollArea className="h-[calc(100%-140px)]">
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
                        <p className="text-xs text-muted-foreground line-clamp-2 break-words">
                          {thread.last_message}
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
        <Card className="lg:col-span-2 border-0 shadow-lg flex flex-col h-full min-h-0">
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
                  
                  {/* Refresh and AI Control Toggle */}
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        fetchThreads();
                        if (selectedThread) {
                          fetchMessages(selectedThread.thread_id);
                        }
                        toast.success("Refreshed");
                      }}
                      title="Refresh conversation"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">AI Agent:</span>
                    <Switch
                      checked={selectedThread.ai_control}
                      onCheckedChange={async (checked) => {
                        try {
                          console.log('Toggle clicked, new state:', checked);
                          
                          const { error } = await supabase
                            .from('threads')
                            .update({ ai_control: checked })
                            .eq('id', selectedThread.id);
                          
                          if (error) {
                            console.error('Database update error:', error);
                            toast.error("Failed to update AI control");
                            return;
                          }

                          setSelectedThread({ ...selectedThread, ai_control: checked });
                          toast.success(checked ? "AI control enabled" : "AI control disabled");
                          
                          // Trigger webhook for AI control change
                          const { data: webhooks, error: webhookError } = await supabase
                            .from('webhooks_config')
                            .select('endpoint')
                            .eq('name', 'ai_control_change')
                            .maybeSingle();
                          
                          if (webhookError) {
                            console.error('Webhook fetch error:', webhookError);
                          }
                          
                          if (webhooks?.endpoint) {
                            console.log('Calling webhook:', webhooks.endpoint);
                            try {
                              const { data: { user } } = await supabase.auth.getUser();
                              const response = await fetch(webhooks.endpoint, {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  thread_id: selectedThread.thread_id,
                                  ai_control: checked,
                                  owner_id: user?.id
                                }),
                              });
                              console.log('Webhook response:', response.status);
                            } catch (error) {
                              console.error('Webhook error:', error);
                            }
                          } else {
                            console.log('No webhook configured for ai_control_change');
                          }
                        } catch (error) {
                          console.error('Error in toggle handler:', error);
                          toast.error("An error occurred");
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
              <div className="flex-1 min-h-0 overflow-hidden">
                <ScrollArea className="h-full p-4">
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
                            <p className="text-sm break-words">{message.message}</p>
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
                                <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
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
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    maxLength={1000}
                    disabled={isSending}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && !isSending) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button 
                    size="icon"
                    onClick={sendMessage}
                    disabled={isSending}
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
