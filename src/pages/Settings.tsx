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

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}
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
    
    // Check Facebook SDK status
    const checkFBStatus = setInterval(() => {
      if (window.FB) {
        clearInterval(checkFBStatus);
        window.FB.getLoginStatus((response: any) => {
          console.log('FB Login Status:', response);
        });
      }
    }, 100);
    
    return () => clearInterval(checkFBStatus);
  }, []);

  const loadUserSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load Facebook pages
      const { data: fbPages } = await supabase
        .from('facebook_pages')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Load Instagram accounts
      const { data: igAccounts } = await supabase
        .from('instagram_accounts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Load settings for webhooks
      const { data: settings } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Store original tokens and display masked versions
      setOriginalTokens({
        fb_page_token: fbPages?.access_token || "",
        ig_page_token: igAccounts ? fbPages?.access_token || "" : ""
      });
      
      setUserSettings({
        fb_page_token: maskToken(fbPages?.access_token),
        ig_page_token: maskToken(igAccounts ? fbPages?.access_token : ""),
        ig_cmnt_reply_webhook: settings?.ig_cmnt_reply_webhook || "",
        fb_cmnt_reply_webhook: settings?.fb_cmnt_reply_webhook || "",
        ig_dm_reply_webhook: settings?.ig_dm_reply_webhook || ""
      });

      // Create default settings if none exist
      if (!settings) {
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('webhooks_config')
        .select('name, endpoint')
        .eq('user_id', user.id);

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

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const upsertPromises = Object.entries(webhookUrls).map(([key, url]) => {
        const config = webhookMap[key as keyof typeof webhookMap];
        if (!url) return null; // Skip empty URLs

        return supabase
          .from('webhooks_config')
          .upsert({
            user_id: user.id,
            name: config.name,
            endpoint: url,
            description: config.description,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'name,user_id'
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

  const handleFacebookLogin = async () => {
    if (!window.FB) {
      toast.error("Facebook SDK not loaded yet. Please refresh the page.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      return;
    }

    window.FB.login(async (response: any) => {
      console.log('Facebook login response:', response);
      
      if (response.authResponse) {
        const accessToken = response.authResponse.accessToken;
        
        // Get user's pages
        window.FB.api('/me/accounts', { access_token: accessToken }, async (pagesResponse: any) => {
          console.log('Pages response:', pagesResponse);
          
          if (pagesResponse.data && pagesResponse.data.length > 0) {
            const page = pagesResponse.data[0];
            const pageAccessToken = page.access_token;
            const pageId = page.id;
            const pageName = page.name;
            
            // Save to facebook_pages table
            const { error: fbError } = await supabase
              .from('facebook_pages')
              .upsert({
                user_id: user.id,
                page_id: pageId,
                page_name: pageName,
                access_token: pageAccessToken,
                is_connected: true
              }, {
                onConflict: 'user_id,page_id'
              });

            if (fbError) {
              console.error('Error saving Facebook page:', fbError);
              toast.error("Failed to save Facebook connection");
              return;
            }

            // Create social media account record
            await supabase.from('social_media_accounts').upsert({
              user_id: user.id,
              platform: 'facebook',
              account_name: pageName,
              account_id: pageId,
              is_active: true
            }, {
              onConflict: 'user_id,platform,account_id'
            });
            
            setUserSettings(prev => ({
              ...prev,
              fb_page_token: pageAccessToken
            }));
            
            toast.success("Connected to Facebook successfully!");
            await loadUserSettings();
          } else {
            toast.error("No Facebook pages found. Please create a page first.");
          }
        });
      } else {
        toast.error("Facebook login cancelled or failed");
      }
    }, {
      config_id: '1550441642558892',
      scope: 'pages_show_list,pages_read_engagement,pages_manage_metadata,pages_messaging',
      return_scopes: true
    });
  };

  const handleInstagramLogin = async () => {
    if (!window.FB) {
      toast.error("Facebook SDK not loaded yet. Please refresh the page.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      return;
    }

    window.FB.login(async (response: any) => {
      console.log('Instagram login response:', response);
      
      if (response.authResponse) {
        const accessToken = response.authResponse.accessToken;
        
        // Get user's pages to find Instagram Business Account
        window.FB.api('/me/accounts', { access_token: accessToken }, async (pagesResponse: any) => {
          console.log('Pages response:', pagesResponse);
          
          if (pagesResponse.data && pagesResponse.data.length > 0) {
            const page = pagesResponse.data[0];
            const pageAccessToken = page.access_token;
            const pageId = page.id;
            const pageName = page.name;
            
            // Get Instagram Business Account connected to this page
            window.FB.api(
              `/${pageId}`,
              { fields: 'instagram_business_account', access_token: pageAccessToken },
              async (igResponse: any) => {
                console.log('Instagram account response:', igResponse);
                
                if (igResponse.instagram_business_account) {
                  const igBusinessAccountId = igResponse.instagram_business_account.id;

                  // Save Facebook page first
                  const { error: fbError } = await supabase
                    .from('facebook_pages')
                    .upsert({
                      user_id: user.id,
                      page_id: pageId,
                      page_name: pageName,
                      access_token: pageAccessToken,
                      instagram_business_account_id: igBusinessAccountId,
                      is_connected: true
                    }, {
                      onConflict: 'user_id,page_id'
                    });

                  if (fbError) {
                    console.error('Error saving Facebook page:', fbError);
                    toast.error("Failed to save Instagram connection");
                    return;
                  }

                  // Get the facebook_page record to link
                  const { data: fbPage } = await supabase
                    .from('facebook_pages')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('page_id', pageId)
                    .single();

                  // Save Instagram account
                  await supabase.from('instagram_accounts').upsert({
                    user_id: user.id,
                    facebook_page_id: fbPage?.id,
                    instagram_account_id: igBusinessAccountId,
                    is_connected: true
                  }, {
                    onConflict: 'user_id,instagram_account_id'
                  });

                  // Create social media account record
                  await supabase.from('social_media_accounts').upsert({
                    user_id: user.id,
                    platform: 'instagram',
                    account_name: pageName,
                    account_id: igBusinessAccountId,
                    is_active: true
                  }, {
                    onConflict: 'user_id,platform,account_id'
                  });
                  
                  setUserSettings(prev => ({
                    ...prev,
                    ig_page_token: pageAccessToken
                  }));
                  
                  toast.success("Connected to Instagram successfully!");
                  await loadUserSettings();
                } else {
                  toast.error("No Instagram Business Account found. Please connect an Instagram Business Account to your Facebook page.");
                }
              }
            );
          } else {
            toast.error("No Facebook pages found. Please create a page and connect an Instagram Business Account.");
          }
        });
      } else {
        toast.error("Instagram login cancelled or failed");
      }
    }, {
      config_id: '1550441642558892',
      scope: 'pages_show_list,instagram_basic,instagram_manage_comments,instagram_manage_messages',
      return_scopes: true
    });
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
              {/* OAuth Connection Section */}
              <div className="p-4 border rounded-lg bg-card/50">
                <h4 className="font-medium mb-3">Connect Social Media Accounts</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your Facebook and Instagram accounts to automatically retrieve access tokens
                </p>
                <div className="space-y-3">
                  <Button 
                    onClick={handleFacebookLogin}
                    variant="outline"
                    className="w-full"
                    type="button"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Connect Facebook
                  </Button>
                  
                  <Button 
                    onClick={handleInstagramLogin}
                    variant="outline"
                    className="w-full"
                    type="button"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    Connect Instagram
                  </Button>
                </div>
              </div>

              {/* Manual Token Entry */}
              <div className="space-y-4">
                <div>
                  <Label>Facebook Page Token</Label>
                  <div className="relative mt-2">
                    <Input
                      type={showTokens.fb_page_token ? "text" : "password"}
                      placeholder="Enter Facebook Page Token or connect above"
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
                      placeholder="Enter Instagram Page Token or connect above"
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