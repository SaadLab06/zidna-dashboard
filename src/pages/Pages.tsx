import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePageRole } from "@/hooks/usePageRole";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Crown, Search, Trash2, UserMinus, X, Filter } from "lucide-react";
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
  const [showOnlyAccepted, setShowOnlyAccepted] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

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
    let filtered = pageRoles;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(page => 
        page.pageName.toLowerCase().includes(query) ||
        page.roles.some(role => role.toLowerCase().includes(query))
      );
    }

    // Apply approval filter
    if (showOnlyAccepted) {
      filtered = filtered.filter(page => page.approvalStatus === "accepted");
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(page => page.relationStatus === statusFilter);
    }

    return filtered;
  }, [pageRoles, searchQuery, showOnlyAccepted, statusFilter]);

  const handleApprovalChange = (pageId: string, checked: boolean) => {
    // TODO: Implement approval status update
    console.log("Update approval for page:", pageId, "to", checked ? "accepted" : "pending");
  };

  const handleStatusChange = (pageId: string, value: string) => {
    // TODO: Implement status update
    console.log("Update status for page:", pageId, "to", value);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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

      <Card className="border-border/40 overflow-hidden">
        <div className="border-b border-border/40 bg-gradient-to-r from-muted/30 to-muted/10 px-6 py-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pages by name or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background/50 backdrop-blur-sm border-border/60"
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

            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border/20">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Filters:</span>
              </div>
              
              <div className="flex items-center gap-3 bg-background/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/40">
                <Label htmlFor="approval-filter" className="text-sm font-medium whitespace-nowrap">
                  Accepted Only
                </Label>
                <Switch
                  id="approval-filter"
                  checked={showOnlyAccepted}
                  onCheckedChange={setShowOnlyAccepted}
                />
              </div>

              <div className="flex items-center gap-3 bg-background/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/40">
                <Label htmlFor="status-filter" className="text-sm font-medium whitespace-nowrap">
                  Status
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status-filter" className="h-8 w-[130px] text-sm">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="banished">Banished</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(showOnlyAccepted || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowOnlyAccepted(false);
                    setStatusFilter("all");
                  }}
                  className="h-8 text-xs gap-1"
                >
                  Clear Filters
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/40 bg-muted/5">
                <TableHead className="w-12 pl-6">
                  <Checkbox
                    checked={filteredPages.length > 0 && selectedPages.length === filteredPages.length}
                    onCheckedChange={(checked) => {
                      setSelectedPages(checked ? filteredPages.map(p => p.pageId) : []);
                    }}
                  />
                </TableHead>
                <TableHead className="font-semibold">Page</TableHead>
                <TableHead className="font-semibold text-center">Status</TableHead>
                <TableHead className="font-semibold text-center pr-6">Approval</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPages.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    {searchQuery || showOnlyAccepted || statusFilter !== "all" 
                      ? "No pages match your filters" 
                      : "No pages available"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPages.map((page) => (
                  <TableRow
                    key={page.pageId}
                    className="cursor-pointer hover:bg-accent/50 border-border/40 transition-all group"
                    onClick={(e) => handleRowClick(page.pageId, e)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()} className="pl-6">
                      <Checkbox
                        checked={selectedPages.includes(page.pageId)}
                        onCheckedChange={() => handleSelectPage(page.pageId)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-border/40">
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-semibold text-sm">
                            {getInitials(page.pageName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2">
                          {page.isOwner && (
                            <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                          )}
                          <span className="font-medium group-hover:text-primary transition-colors">{page.pageName}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center">
                        <Select
                          value={page.relationStatus}
                          onValueChange={(value) => handleStatusChange(page.pageId, value)}
                        >
                          <SelectTrigger className="h-8 w-[120px] text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                Active
                              </div>
                            </SelectItem>
                            <SelectItem value="pending">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                                Pending
                              </div>
                            </SelectItem>
                            <SelectItem value="banished">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-red-500" />
                                Banished
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()} className="pr-6">
                      <div className="flex items-center justify-center gap-2">
                        <Label 
                          htmlFor={`approval-${page.pageId}`}
                          className="text-xs text-muted-foreground cursor-pointer"
                        >
                          {page.approvalStatus === "accepted" ? "Accepted" : "Pending"}
                        </Label>
                        <Switch
                          id={`approval-${page.pageId}`}
                          checked={page.approvalStatus === "accepted"}
                          onCheckedChange={(checked) => handleApprovalChange(page.pageId, checked)}
                        />
                      </div>
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
