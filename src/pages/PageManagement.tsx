import { useParams, useNavigate } from "react-router-dom";
import { usePageRole } from "@/hooks/usePageRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Crown, Users, Settings as SettingsIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const PageManagement = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const { pageRoles, loading } = usePageRole(pageId);

  const page = pageRoles.find(p => p.pageId === pageId);

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
          <h1 className="text-3xl font-bold">{page.pageName}</h1>
        </div>
        <p className="text-muted-foreground">
          Manage settings and permissions for this page
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
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Page Management</CardTitle>
          <CardDescription>
            Configure settings and manage access for this page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Page Settings</p>
                <p className="text-sm text-muted-foreground">
                  Configure webhooks, automation, and integrations
                </p>
              </div>
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Team Management</p>
                <p className="text-sm text-muted-foreground">
                  Invite team members and manage permissions
                </p>
              </div>
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PageManagement;
