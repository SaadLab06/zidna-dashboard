import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bot, Bell, Webhook, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { validateWebhookForStorage } from "@/lib/webhookValidation";
import { maskToken, isMaskedToken } from "@/lib/tokenMasking";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff } from "lucide-react";
const Settings = () => {
  const [webhookUrls, setWebhookUrls] = useState({
    commentReply: "",
    dmReply: "",
    deleteComment: "",
    uploadFile: "",
    deleteFile: "",
    giveControl: "",
    takeControl: ""
  });
  const [loading, setLoading] = useState(false);
  const [userSettings, setUserSettings] = useState({
    fb_page_token: "",
    ig_page_token: "",
    ig_cmnt_reply_webhook: "",
    fb_cmnt_reply_webhook: "",
    ig_dm_reply_webhook: ""
  });
  const [showTokens, setShowTokens] = useState({
    fb_page_token: false,
    ig_page_token: false
  });
  const [originalTokens, setOriginalTokens] = useState({
    fb_page_token: "",
    ig_page_token: ""
  });

  // Load existing webhooks and settings on mount
  useEffect(() => {
    loadWebhooks();
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Store original tokens and display masked versions
        setOriginalTokens({
          fb_page_token: data.fb_page_token || "",
          ig_page_token: data.ig_page_token || ""
        });
        
        setUserSettings({
          fb_page_token: maskToken(data.fb_page_token),
          ig_page_token: maskToken(data.ig_page_token),
          ig_cmnt_reply_webhook: data.ig_cmnt_reply_webhook || "",
          fb_cmnt_reply_webhook: data.fb_cmnt_reply_webhook || "",
          ig_dm_reply_webhook: data.ig_dm_reply_webhook || ""
        });
      } else {
        // Create default settings for new user
        await supabase.from('settings').insert({
          user_id: user.id
        });
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
      toast.error("Failed to load user settings");
    }
  };

  const saveUserSettings = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Only update tokens if they've been changed (not masked)
      const settingsToSave: any = {
        ig_cmnt_reply_webhook: userSettings.ig_cmnt_reply_webhook,
        fb_cmnt_reply_webhook: userSettings.fb_cmnt_reply_webhook,
        ig_dm_reply_webhook: userSettings.ig_dm_reply_webhook
      };

      if (!isMaskedToken(userSettings.fb_page_token)) {
        settingsToSave.fb_page_token = userSettings.fb_page_token;
      }
      if (!isMaskedToken(userSettings.ig_page_token)) {
        settingsToSave.ig_page_token = userSettings.ig_page_token;
      }

      const { error } = await supabase
        .from('settings')
        .upsert({
          user_id: user.id,
          ...settingsToSave
        });

      if (error) throw error;

      toast.success("Settings saved successfully");
      await loadUserSettings();
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const loadWebhooks = async () => {
    try {
      const { data, error } = await supabase
        .from('webhooks_config')
        .select('name, endpoint');

      if (error) throw error;

      if (data) {
        const webhookMap: any = {
          comment_reply: "commentReply",
          dm_reply: "dmReply",
          delete_comment: "deleteComment",
          upload_file: "uploadFile",
          delete_file: "deleteFile",
          give_control: "giveControl",
          take_control: "takeControl"
        };

        const loadedWebhooks = { ...webhookUrls };
        data.forEach((webhook) => {
          const key = webhookMap[webhook.name];
          if (key) {
            loadedWebhooks[key as keyof typeof loadedWebhooks] = webhook.endpoint || "";
          }
        });
        setWebhookUrls(loadedWebhooks);
      }
    } catch (error) {
      console.error('Error loading webhooks:', error);
      toast.error("Failed to load webhook configuration");
    }
  };

  const handleSaveWebhooks = async () => {
    // Validate all webhook URLs before saving
    const webhooksToValidate = Object.entries(webhookUrls);
    for (const [name, url] of webhooksToValidate) {
      if (url) {
        const validation = validateWebhookForStorage(url);
        if (!validation.valid) {
          toast.error(`Invalid webhook URL for ${name}: ${validation.error}`);
          return;
        }
      }
    }

    setLoading(true);
    try {
      const webhookMap = {
        commentReply: { name: "comment_reply", description: "Endpoint for sending comment replies to platforms" },
        dmReply: { name: "dm_reply", description: "Endpoint for sending direct message replies" },
        deleteComment: { name: "delete_comment", description: "Endpoint for deleting comments from platforms" },
        uploadFile: { name: "upload_file", description: "Endpoint for uploading and embedding AI documents" },
        deleteFile: { name: "delete_file", description: "Endpoint for deleting AI documents" },
        giveControl: { name: "give_control", description: "Endpoint to enable AI auto-reply for a conversation" },
        takeControl: { name: "take_control", description: "Endpoint to disable AI auto-reply and take manual control" }
      };

      const upsertPromises = Object.entries(webhookUrls).map(([key, url]) => {
        const config = webhookMap[key as keyof typeof webhookMap];
        if (!url) return null; // Skip empty URLs

        return supabase
          .from('webhooks_config')
          .upsert({
            name: config.name,
            endpoint: url,
            description: config.description,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'name'
          });
      });

      const results = await Promise.all(upsertPromises.filter(p => p !== null));
      
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        throw errors[0].error;
      }

      toast.success("Webhook configuration saved successfully");
    } catch (error) {
      console.error('Error saving webhooks:', error);
      toast.error("Failed to save webhook configuration");
    } finally {
      setLoading(false);
    }
  };
  return <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Configure your social media integrations and AI preferences</p>
      </div>

      {/* Security Warning */}
      

      <Tabs defaultValue="ai" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ai">AI Config</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-6">
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Platform Tokens</h3>
                <p className="text-sm text-muted-foreground">Manage your platform access tokens</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <Label>Facebook Page Token</Label>
                <div className="relative mt-2">
                  <Input
                    type={showTokens.fb_page_token ? "text" : "password"}
                    placeholder="Enter Facebook Page Token"
                    value={userSettings.fb_page_token}
                    onChange={(e) => setUserSettings({ ...userSettings, fb_page_token: e.target.value })}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowTokens({ ...showTokens, fb_page_token: !showTokens.fb_page_token })}
                  >
                    {showTokens.fb_page_token ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Token is masked for security. Only change if needed.
                </p>
              </div>
              <div>
                <Label>Instagram Page Token</Label>
                <div className="relative mt-2">
                  <Input
                    type={showTokens.ig_page_token ? "text" : "password"}
                    placeholder="Enter Instagram Page Token"
                    value={userSettings.ig_page_token}
                    onChange={(e) => setUserSettings({ ...userSettings, ig_page_token: e.target.value })}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowTokens({ ...showTokens, ig_page_token: !showTokens.ig_page_token })}
                  >
                    {showTokens.ig_page_token ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Token is masked for security. Only change if needed.
                </p>
              </div>
              <div>
                <Label>Instagram Comment Reply Webhook</Label>
                <Input
                  placeholder="https://your-webhook.com/ig-comment"
                  className="mt-2"
                  value={userSettings.ig_cmnt_reply_webhook}
                  onChange={(e) => setUserSettings({ ...userSettings, ig_cmnt_reply_webhook: e.target.value })}
                />
              </div>
              <div>
                <Label>Facebook Comment Reply Webhook</Label>
                <Input
                  placeholder="https://your-webhook.com/fb-comment"
                  className="mt-2"
                  value={userSettings.fb_cmnt_reply_webhook}
                  onChange={(e) => setUserSettings({ ...userSettings, fb_cmnt_reply_webhook: e.target.value })}
                />
              </div>
              <div>
                <Label>Instagram DM Reply Webhook</Label>
                <Input
                  placeholder="https://your-webhook.com/ig-dm"
                  className="mt-2"
                  value={userSettings.ig_dm_reply_webhook}
                  onChange={(e) => setUserSettings({ ...userSettings, ig_dm_reply_webhook: e.target.value })}
                />
              </div>
              <Button 
                className="w-full gradient-primary" 
                onClick={saveUserSettings}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Platform Settings"}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <Bell className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Notification Preferences</h3>
                <p className="text-sm text-muted-foreground">Choose what to be notified about</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>New Comments</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label>New Direct Messages</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label>AI Responses</Label>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <Label>Email Notifications</Label>
                <Switch />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-lg bg-info/10 flex items-center justify-center">
                <Webhook className="h-6 w-6 text-info" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Webhook Configuration</h3>
                <p className="text-sm text-muted-foreground">Manage external integrations</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Comment Reply Webhook</Label>
                <Input placeholder="https://hooks.zapier.com/..." className="mt-2" value={webhookUrls.commentReply} onChange={e => setWebhookUrls({
                ...webhookUrls,
                commentReply: e.target.value
              })} />
                <p className="text-xs text-muted-foreground mt-1">
                  Endpoint for sending comment replies to platforms
                </p>
              </div>
              <div>
                <Label>DM Reply Webhook</Label>
                <Input placeholder="https://hooks.zapier.com/..." className="mt-2" value={webhookUrls.dmReply} onChange={e => setWebhookUrls({
                ...webhookUrls,
                dmReply: e.target.value
              })} />
                <p className="text-xs text-muted-foreground mt-1">
                  Endpoint for sending direct message replies
                </p>
              </div>
              <div>
                <Label>Delete Comment Webhook</Label>
                <Input placeholder="https://hooks.zapier.com/..." className="mt-2" value={webhookUrls.deleteComment} onChange={e => setWebhookUrls({
                ...webhookUrls,
                deleteComment: e.target.value
              })} />
                <p className="text-xs text-muted-foreground mt-1">
                  Endpoint for deleting comments from platforms
                </p>
              </div>
              <div>
                <Label>Upload File Webhook (AI Documents)</Label>
                <Input placeholder="https://hooks.zapier.com/..." className="mt-2" value={webhookUrls.uploadFile} onChange={e => setWebhookUrls({
                ...webhookUrls,
                uploadFile: e.target.value
              })} />
                <p className="text-xs text-muted-foreground mt-1">
                  Endpoint for uploading and embedding AI documents
                </p>
              </div>
              <div>
                <Label>Delete Document Webhook (AI Documents)</Label>
                <Input placeholder="https://hooks.zapier.com/..." className="mt-2" value={webhookUrls.deleteFile} onChange={e => setWebhookUrls({
                ...webhookUrls,
                deleteFile: e.target.value
              })} />
                <p className="text-xs text-muted-foreground mt-1">
                  Endpoint for deleting AI documents
                </p>
              </div>
              <div>
                <Label>Give AI Control Webhook</Label>
                <Input placeholder="https://hooks.zapier.com/..." className="mt-2" value={webhookUrls.giveControl} onChange={e => setWebhookUrls({
                ...webhookUrls,
                giveControl: e.target.value
              })} />
                <p className="text-xs text-muted-foreground mt-1">
                  Endpoint to enable AI auto-reply for a conversation
                </p>
              </div>
              <div>
                <Label>Take Control Webhook</Label>
                <Input placeholder="https://hooks.zapier.com/..." className="mt-2" value={webhookUrls.takeControl} onChange={e => setWebhookUrls({
                ...webhookUrls,
                takeControl: e.target.value
              })} />
                <p className="text-xs text-muted-foreground mt-1">
                  Endpoint to disable AI auto-reply and take manual control
                </p>
              </div>
              <Button className="w-full gradient-primary" onClick={handleSaveWebhooks} disabled={loading}>
                {loading ? "Saving..." : "Save Webhook Configuration"}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card className="p-6 border-0 shadow-lg">
            <h3 className="text-lg font-semibold mb-6">System Information</h3>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium">2 days ago</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Database Status</span>
                <Badge className="bg-success">Connected</Badge>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Support</span>
                <a href="mailto:support@example.com" className="text-primary hover:underline">
                  Contact Support
                </a>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
};
export default Settings;