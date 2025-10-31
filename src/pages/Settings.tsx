import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Link2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState({
    facebook: false,
    instagram: false,
    tiktok: false
  });

  useEffect(() => {
    loadConnectedAccounts();
    
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

  const loadConnectedAccounts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check Facebook connection
      const { data: fbPages } = await supabase
        .from('facebook_pages' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('is_connected', true)
        .maybeSingle();

      // Check Instagram connection
      const { data: igAccounts } = await supabase
        .from('instagram_accounts' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('is_connected', true)
        .maybeSingle();

      setConnectedAccounts({
        facebook: !!fbPages,
        instagram: !!igAccounts,
        tiktok: false
      });
    } catch (error) {
      console.error('Error loading connected accounts:', error);
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

    setLoading(true);
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
              .from('facebook_pages' as any)
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
              setLoading(false);
              return;
            }

            // Create social media account record
            await supabase.from('social_media_accounts' as any).upsert({
              user_id: user.id,
              platform: 'facebook',
              account_name: pageName,
              account_id: pageId,
              is_active: true
            }, {
              onConflict: 'user_id,platform,account_id'
            });
            
            toast.success("Connected to Facebook successfully!");
            await loadConnectedAccounts();
          } else {
            toast.error("No Facebook pages found. Please create a page first.");
          }
          setLoading(false);
        });
      } else {
        toast.error("Facebook login cancelled or failed");
        setLoading(false);
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

    setLoading(true);
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
                    .from('facebook_pages' as any)
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
                    setLoading(false);
                    return;
                  }

                  // Get the facebook_page record to link
                  const { data: fbPage } = await supabase
                    .from('facebook_pages' as any)
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('page_id', pageId)
                    .single();

                  // Save Instagram account
                  await supabase.from('instagram_accounts' as any).upsert({
                    user_id: user.id,
                    facebook_page_id: (fbPage as any)?.id,
                    instagram_account_id: igBusinessAccountId,
                    is_connected: true
                  }, {
                    onConflict: 'user_id,instagram_account_id'
                  });

                  // Create social media account record
                  await supabase.from('social_media_accounts' as any).upsert({
                    user_id: user.id,
                    platform: 'instagram',
                    account_name: pageName,
                    account_id: igBusinessAccountId,
                    is_active: true
                  }, {
                    onConflict: 'user_id,platform,account_id'
                  });
                  
                  toast.success("Connected to Instagram successfully!");
                  await loadConnectedAccounts();
                } else {
                  toast.error("No Instagram Business Account found. Please connect an Instagram Business Account to your Facebook page.");
                }
                setLoading(false);
              }
            );
          } else {
            toast.error("No Facebook pages found. Please create a page and connect an Instagram Business Account.");
            setLoading(false);
          }
        });
      } else {
        toast.error("Instagram login cancelled or failed");
        setLoading(false);
      }
    }, {
      config_id: '1550441642558892',
      scope: 'pages_show_list,instagram_basic,instagram_manage_comments,instagram_manage_messages',
      return_scopes: true
    });
  };

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Configure your preferences</p>
      </div>

      <Tabs defaultValue="social" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="social" className="space-y-6">
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Link2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Connected Accounts</h3>
                <p className="text-sm text-muted-foreground">Connect your social media platforms</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Facebook */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Facebook</p>
                    <p className="text-xs text-muted-foreground">
                      {connectedAccounts.facebook ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleFacebookLogin}
                  disabled={loading || connectedAccounts.facebook}
                  variant={connectedAccounts.facebook ? "outline" : "default"}
                >
                  {connectedAccounts.facebook ? "Connected" : "Connect"}
                </Button>
              </div>

              {/* Instagram */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500/10 flex items-center justify-center">
                    <svg className="h-5 w-5 text-pink-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Instagram</p>
                    <p className="text-xs text-muted-foreground">
                      {connectedAccounts.instagram ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleInstagramLogin}
                  disabled={loading || connectedAccounts.instagram}
                  variant={connectedAccounts.instagram ? "outline" : "default"}
                >
                  {connectedAccounts.instagram ? "Connected" : "Connect"}
                </Button>
              </div>

              {/* TikTok */}
              <div className="flex items-center justify-between p-4 border rounded-lg opacity-60">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-slate-500/10 flex items-center justify-center">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">TikTok</p>
                    <p className="text-xs text-muted-foreground">Coming soon</p>
                  </div>
                </div>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
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
    </div>
  );
};

export default Settings;
