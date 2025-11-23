import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePageRole } from "@/hooks/usePageRole";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crown, Search, Trash2, UserMinus, X } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleBulkDelete = () => {
    // TODO: Implement bulk delete
    console.log("Delete pages:", selectedPages);
  };

  const handleBulkLeave = () => {
    // TODO: Implement bulk leave
    console.log("Leave pages:", selectedPages);
  };

  const filteredPages = useMemo(() => {
    if (!searchQuery.trim()) return pageRoles;
    const query = searchQuery.toLowerCase();
    return pageRoles.filter(page => 
      page.pageName.toLowerCase().includes(query) ||
      page.roles.some(role => role.toLowerCase().includes(query))
    );
  }, [pageRoles, searchQuery]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Pages</h1>
          <p className="text-muted-foreground mt-1">Manage your social media pages and team access</p>
        </div>
        <Card className="border-border/40">
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Pages</h1>
          <p className="text-muted-foreground mt-1">Manage your social media pages and team access</p>
        </div>
        <Card className="border-border/40">
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No Pages Found</h3>
            <p className="text-muted-foreground">
              You don't have access to any pages yet. Connect a Facebook or Instagram page to get started.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Pages</h1>
        <p className="text-muted-foreground mt-1">
          Manage your social media pages and team access
        </p>
      </div>

      <Card className="border-border/40">
        <div className="border-b border-border/40 bg-muted/20 px-6 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pages by name or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            
            {selectedPages.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground mr-2">
                  {selectedPages.length} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkLeave}
                  className="gap-2"
                >
                  <UserMinus className="h-4 w-4" />
                  Leave
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPages([])}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/40">
                <TableHead className="w-12 pl-6">
                  <Checkbox
                    checked={filteredPages.length > 0 && selectedPages.length === filteredPages.length}
                    onCheckedChange={(checked) => {
                      setSelectedPages(checked ? filteredPages.map(p => p.pageId) : []);
                    }}
                  />
                </TableHead>
                <TableHead className="font-semibold">Page Name</TableHead>
                <TableHead className="font-semibold">Roles</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold pr-6">Approval</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPages.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    {searchQuery ? "No pages found matching your search" : "No pages available"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPages.map((page) => (
                  <TableRow
                    key={page.pageId}
                    className="cursor-pointer hover:bg-muted/30 border-border/40 transition-colors"
                    onClick={(e) => handleRowClick(page.pageId, e)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()} className="pl-6">
                      <Checkbox
                        checked={selectedPages.includes(page.pageId)}
                        onCheckedChange={() => handleSelectPage(page.pageId)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {page.isOwner && (
                          <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                        )}
                        <span className="font-medium">{page.pageName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {page.roles.map((role) => (
                          <Badge key={role} variant="secondary" className="text-xs font-normal">
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
                        className="font-normal"
                      >
                        {page.relationStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6">
                      <Badge
                        variant={
                          page.approvalStatus === "accepted"
                            ? "default"
                            : page.approvalStatus === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                        className="font-normal"
                      >
                        {page.approvalStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Pages;
