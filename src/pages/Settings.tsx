import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Link2, User, Lock, FileText, Shield } from "lucide-react";
import { Link } from "react-router-dom";
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
  const [connectedAccounts, setConnectedAccounts] = useState<Array<{
    id: string;
    platform: 'facebook' | 'instagram';
    name: string;
    accountId: string;
  }>>([]);
  
  // Profile states
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    loadConnectedAccounts();
    loadProfile();
    
    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      handleOAuthCallback(code);
    }
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || "");
        setPhoneNumber(profile.phone_number || "");
        setDateOfBirth(profile.date_of_birth || "");
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadConnectedAccounts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const accounts: typeof connectedAccounts = [];

      // Get Facebook pages
      const { data: fbPages } = await supabase
        .from('facebook_pages' as any)
        .select('*')
        .or(`user_id.eq.${user.id},owner_id.eq.${user.id}`)
        .eq('is_connected', true);

      if (fbPages && fbPages.length > 0) {
        fbPages.forEach((page: any) => {
          accounts.push({
            id: page.id,
            platform: 'facebook',
            name: page.page_name,
            accountId: page.page_id
          });
        });
      }

      // Get Instagram accounts
      const { data: igAccounts } = await supabase
        .from('instagram_accounts' as any)
        .select('*')
        .or(`user_id.eq.${user.id},owner_id.eq.${user.id}`)
        .eq('is_connected', true);

      if (igAccounts && igAccounts.length > 0) {
        igAccounts.forEach((account: any) => {
          accounts.push({
            id: account.id,
            platform: 'instagram',
            name: `Instagram ${account.instagram_account_id}`,
            accountId: account.instagram_account_id
          });
        });
      }

      setConnectedAccounts(accounts);
    } catch (error) {
      console.error('Error loading connected accounts:', error);
    }
  };

  const handleConnectSocialMedia = () => {
    const FACEBOOK_APP_ID = '1429675601428085';
    const redirectUri = encodeURIComponent('https://zidna-sociahub.lovable.app/');
    const scope = 'pages_show_list,pages_read_engagement,pages_manage_metadata,pages_messaging,instagram_basic,instagram_manage_messages,instagram_manage_comments';
    
    const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
    
    window.location.href = authUrl;
  };

  const handleOAuthCallback = async (code: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Not authenticated");
        return;
      }

      // Call edge function to handle OAuth callback
      const { data, error } = await supabase.functions.invoke('facebook-oauth-callback', {
        body: { code, userId: user.id }
      });

      if (error) throw error;

      if (data.success) {
        toast.success("Connected successfully!");
        
        // Show detailed results
        if (data.results && data.results.length > 0) {
          data.results.forEach((result: any) => {
            if (result.facebook === 'success') {
              toast.success(`Facebook page "${result.page}" connected`);
            }
            if (result.instagram === 'success') {
              toast.success(`Instagram account connected for "${result.page}"`);
            } else if (result.instagram === 'not_found') {
              toast.info(`No Instagram account found for "${result.page}"`);
            }
          });
        }
        
        await loadConnectedAccounts();
        
        // Remove code from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        throw new Error(data.error || 'Connection failed');
      }
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      toast.error(error.message || "Failed to connect accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (accountId: string, platform: 'facebook' | 'instagram') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (platform === 'facebook') {
        await supabase
          .from('facebook_pages' as any)
          .update({ is_connected: false })
          .eq('id', accountId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('instagram_accounts' as any)
          .update({ is_connected: false })
          .eq('id', accountId)
          .eq('user_id', user.id);
      }

      toast.success("Account disconnected");
      await loadConnectedAccounts();
    } catch (error) {
      console.error('Error disconnecting account:', error);
      toast.error("Failed to disconnect account");
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Not authenticated");
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone_number: phoneNumber,
          date_of_birth: dateOfBirth
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Configure your preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Personal Information */}
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <p className="text-sm text-muted-foreground">Update your personal details</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleUpdateProfile} 
                disabled={loading}
                className="w-full"
              >
                {loading ? "Updating..." : "Update Profile"}
              </Button>
            </div>
          </Card>

          {/* Password Change */}
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <Lock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Change Password</h3>
                <p className="text-sm text-muted-foreground">Update your account password</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>

              <Button 
                onClick={handleChangePassword} 
                disabled={loading}
                className="w-full"
              >
                {loading ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Link2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Connected Accounts</h3>
                <p className="text-sm text-muted-foreground">Connect your Facebook & Instagram accounts</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Connect Button */}
              <Button 
                onClick={handleConnectSocialMedia}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? "Connecting..." : "Connect Facebook & Instagram"}
              </Button>

              {/* Connected Accounts List */}
              {connectedAccounts.length > 0 && (
                <div className="space-y-3 mt-6">
                  <h4 className="font-medium text-sm text-muted-foreground">Connected Accounts</h4>
                  {connectedAccounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {account.platform === 'facebook' ? (
                          <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500/10 flex items-center justify-center">
                            <svg className="h-5 w-5 text-pink-600" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{account.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-success"></span>
                            Connected
                          </p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleDisconnect(account.id, account.platform)}
                        variant="outline"
                        size="sm"
                      >
                        Disconnect
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Support</span>
                <a href="mailto:hello@zidnadigital.com" className="text-primary hover:underline">
                  Contact Support
                </a>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-lg">
            <h3 className="text-lg font-semibold mb-6">Legal Documents</h3>
            <div className="space-y-4">
              <Link to="/privacy-policy" className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Privacy Policy</p>
                    <p className="text-sm text-muted-foreground">Learn how we protect your data</p>
                  </div>
                </div>
              </Link>
              
              <Link to="/terms-of-service" className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Terms of Service</p>
                    <p className="text-sm text-muted-foreground">Review our terms and conditions</p>
                  </div>
                </div>
              </Link>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
