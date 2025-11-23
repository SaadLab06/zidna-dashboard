import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageRole } from "@/hooks/usePageRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Facebook, Instagram, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Pages = () => {
  const navigate = useNavigate();
  const { pageRoles, loading } = usePageRole();
  const [selectedPages, setSelectedPages] = useState<string[]>([]);

  const handleSelectPage = (pageId: string) => {
    setSelectedPages(prev =>
      prev.includes(pageId)
        ? prev.filter(id => id !== pageId)
        : [...prev, pageId]
    );
  };

  const handleRowClick = (pageId: string, e: React.MouseEvent) => {
    // Don't navigate if clicking the checkbox
    if ((e.target as HTMLElement).closest('[role="checkbox"]')) {
      return;
    }
    navigate(`/pages/${pageId}`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">My Pages</h1>
          <p className="text-muted-foreground">Manage your social media pages</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (pageRoles.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">My Pages</h1>
          <p className="text-muted-foreground">Manage your social media pages</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>No Pages Found</CardTitle>
            <CardDescription>
              You don't have access to any pages yet. Connect a Facebook or Instagram page to get started.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">My Pages</h1>
        <p className="text-muted-foreground">
          Manage your social media pages • {selectedPages.length} selected
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedPages.length === pageRoles.length}
                    onCheckedChange={(checked) => {
                      setSelectedPages(checked ? pageRoles.map(p => p.pageId) : []);
                    }}
                  />
                </TableHead>
                <TableHead>Page Name</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approval</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRoles.map((page) => (
                <TableRow
                  key={page.pageId}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={(e) => handleRowClick(page.pageId, e)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedPages.includes(page.pageId)}
                      onCheckedChange={() => handleSelectPage(page.pageId)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {page.isOwner && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="font-medium">{page.pageName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {page.roles.map((role) => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Pages;
