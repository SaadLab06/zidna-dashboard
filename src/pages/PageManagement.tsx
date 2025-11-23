import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePageRole } from "@/hooks/usePageRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Crown, Users, Settings as SettingsIcon, Zap, MessageSquare, Bot } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const PageManagement = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pageRoles, loading } = usePageRole(pageId);

  const [autoApproval, setAutoApproval] = useState(false);
  const [dmAutoReply, setDmAutoReply] = useState(false);
  const [commentAutoReply, setCommentAutoReply] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");

  const page = pageRoles.find(p => p.pageId === pageId);

  const handleSaveWebhook = () => {
    toast({
      title: "Webhook saved",
      description: "Your webhook configuration has been updated.",
    });
  };

  const handleSaveAutomation = () => {
    toast({
      title: "Automation saved",
      description: "Your automation settings have been updated.",
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/pages")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Pages
        </Button>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/pages")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Pages
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Page Not Found</CardTitle>
            <CardDescription>
              The page you're looking for doesn't exist or you don't have access to it.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate("/pages")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Pages
      </Button>

      <div>
        <div className="flex items-center gap-3 mb-2">
          {page.isOwner && <Crown className="h-6 w-6 text-yellow-500" />}
          <h1 className="text-3xl font-bold tracking-tight">{page.pageName}</h1>
        </div>
        <p className="text-muted-foreground">
          Manage settings, automation, and permissions for this page
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Your Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {page.roles.map((role) => (
                <Badge key={role} variant="secondary">
                  {role}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Relation Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant={
                page.relationStatus === "active"
                  ? "default"
                  : page.relationStatus === "pending"
                  ? "secondary"
                  : "destructive"
              }
            >
              {page.relationStatus}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Approval Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge
                variant={
                  page.approvalStatus === "accepted"
                    ? "default"
                    : page.approvalStatus === "pending"
                    ? "secondary"
                    : "destructive"
                }
              >
                {page.approvalStatus}
              </Badge>
              <div className="flex items-center gap-2">
                <Label htmlFor="auto-approval" className="text-xs text-muted-foreground">
                  Auto
                </Label>
                <Switch
                  id="auto-approval"
                  checked={autoApproval}
                  onCheckedChange={setAutoApproval}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="automation" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="automation">
            <Zap className="h-4 w-4 mr-2" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="webhooks">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="h-4 w-4 mr-2" />
            Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Automation</CardTitle>
              <CardDescription>
                Configure AI-powered automation for comments and messages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="dm-auto-reply" className="text-base font-medium">
                      DM Auto-Reply
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automatically respond to direct messages using AI
                  </p>
                </div>
                <Switch
                  id="dm-auto-reply"
                  checked={dmAutoReply}
                  onCheckedChange={setDmAutoReply}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="comment-auto-reply" className="text-base font-medium">
                      Comment Auto-Reply
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automatically respond to comments using AI
                  </p>
                </div>
                <Switch
                  id="comment-auto-reply"
                  checked={commentAutoReply}
                  onCheckedChange={setCommentAutoReply}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveAutomation}>
                  Save Automation Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>
                Set up webhooks to integrate with external services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  placeholder="https://your-webhook-endpoint.com"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  This webhook will be called for page events (messages, comments, etc.)
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveWebhook}>
                  Save Webhook
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>
                Invite team members and manage their roles for this page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium mb-2">Team management coming soon</p>
                <p className="text-sm">
                  You'll be able to invite team members and assign roles
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PageManagement;
