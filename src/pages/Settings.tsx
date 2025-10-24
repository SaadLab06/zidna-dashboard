import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Instagram, Facebook, Bot, Bell, Webhook } from "lucide-react";

const Settings = () => {
  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Configure your social media integrations and AI preferences</p>
      </div>

      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="ai">AI Config</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6">
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-lg bg-[#E1306C]/10 flex items-center justify-center">
                <Instagram className="h-6 w-6 text-[#E1306C]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Instagram</h3>
                <p className="text-sm text-muted-foreground">Connect your Instagram account</p>
              </div>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                Connected
              </Badge>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Page Access Token</Label>
                <Input type="password" placeholder="••••••••••••••••" className="mt-2" />
              </div>
              <Button variant="outline" className="w-full">Refresh Connection</Button>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-lg bg-[#1877F2]/10 flex items-center justify-center">
                <Facebook className="h-6 w-6 text-[#1877F2]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Facebook</h3>
                <p className="text-sm text-muted-foreground">Connect your Facebook page</p>
              </div>
              <Badge variant="outline">Not Connected</Badge>
            </div>
            <Button className="w-full gradient-primary">Connect Facebook</Button>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">AI Configuration</h3>
                <p className="text-sm text-muted-foreground">Customize AI response behavior</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Reply</Label>
                  <p className="text-sm text-muted-foreground">Enable automatic AI responses</p>
                </div>
                <Switch />
              </div>
              <div>
                <Label>Response Tone</Label>
                <select className="w-full mt-2 px-3 py-2 rounded-md border border-input bg-background">
                  <option>Professional</option>
                  <option>Friendly</option>
                  <option>Casual</option>
                </select>
              </div>
              <div>
                <Label>Response Language</Label>
                <select className="w-full mt-2 px-3 py-2 rounded-md border border-input bg-background">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
              <Button className="w-full gradient-primary">Save AI Configuration</Button>
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
              <Button variant="outline">Test Webhooks</Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Comment Reply Webhook</Label>
                <Input 
                  placeholder="https://your-n8n-instance.com/webhook/comments_send_reply" 
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Endpoint for sending comment replies to platforms
                </p>
              </div>
              <div>
                <Label>DM Reply Webhook</Label>
                <Input 
                  placeholder="https://your-n8n-instance.com/webhook/dm_reply" 
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Endpoint for sending direct message replies
                </p>
              </div>
              <div>
                <Label>Delete Comment Webhook</Label>
                <Input 
                  placeholder="https://your-n8n-instance.com/webhook/delete_comment" 
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Endpoint for deleting comments from platforms
                </p>
              </div>
              <div>
                <Label>Upload File Webhook (AI Documents)</Label>
                <Input 
                  placeholder="https://your-n8n-instance.com/webhook/upload_file" 
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Endpoint for uploading and embedding AI documents
                </p>
              </div>
              <div>
                <Label>Delete Document Webhook (AI Documents)</Label>
                <Input 
                  placeholder="https://your-n8n-instance.com/webhook/delete_file" 
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Endpoint for deleting AI documents
                </p>
              </div>
              <div>
                <Label>Give AI Control Webhook</Label>
                <Input 
                  placeholder="https://your-n8n-instance.com/webhook/give_control" 
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Endpoint to enable AI auto-reply for a conversation
                </p>
              </div>
              <div>
                <Label>Take Control Webhook</Label>
                <Input 
                  placeholder="https://your-n8n-instance.com/webhook/take_control" 
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Endpoint to disable AI auto-reply and take manual control
                </p>
              </div>
              <Button className="w-full gradient-primary">Save Webhook Configuration</Button>
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
