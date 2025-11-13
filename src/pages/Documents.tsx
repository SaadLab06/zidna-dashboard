import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Search, RefreshCw, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { validateSearch } from "@/lib/validation";
import { toast } from "sonner";

const Documents = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, [searchTerm]);

  const fetchDocuments = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Check if user is superadmin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();
    
    const isSuperAdmin = roleData?.role === 'superadmin';

    let query = supabase
      .from('ai_documents' as any)
      .select('*')
      .order('uploaded_at', { ascending: false });

    // Only filter by owner_id if NOT superadmin
    if (!isSuperAdmin) {
      query = query.eq('owner_id', user.id);
    }

    if (searchTerm) {
      const validation = validateSearch(searchTerm);
      if (!validation.success) {
        toast.error(validation.error);
        setLoading(false);
        return;
      }
      query = query.or(`name.ilike.%${validation.data}%,description.ilike.%${validation.data}%`);
    }

    const { data, error } = await query;
    if (!error && data) {
      setDocuments(data);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'indexed':
        return 'bg-success/10 text-success border-success/20';
      case 'processing':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'error':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Use centralized webhook configuration
    const uploadWebhook = 'https://n8n.srv1048592.hstgr.cloud/webhook/upload_file';
    
    if (!uploadWebhook) {
      toast.error("Upload webhook not configured");
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name);
      formData.append('file_type', file.type);
      formData.append('size', file.size.toString());
      formData.append('owner_id', user?.id || '');

        const response = await fetch(uploadWebhook, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      toast.success("Document uploaded successfully");
      fetchDocuments();
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc: any) => {
    // Use centralized webhook configuration
    const deleteWebhook = 'https://n8n.srv1048592.hstgr.cloud/webhook/delete_file';
    
    if (!deleteWebhook) {
      toast.error("Delete webhook not configured");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const response = await fetch(deleteWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_url: doc.file_url,
          document_id: doc.id,
          owner_id: user?.id
        }),
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }

      toast.success("Document deleted successfully");
      fetchDocuments();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error("Failed to delete document");
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">AI Documents</h1>
          <p className="text-muted-foreground mt-2">Manage training documents for AI responses</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchDocuments} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button 
            className="gradient-primary" 
            onClick={handleUploadClick}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Uploading..." : "Upload Document"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt,.md"
          />
        </div>
      </div>

      {/* Search */}
      <Card className="p-4 border-0 shadow-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <Card className="p-6 border-0 shadow-lg col-span-full">
            <p className="text-center text-muted-foreground">Loading documents...</p>
          </Card>
        ) : documents.length === 0 ? (
          <Card className="p-12 border-0 shadow-lg col-span-full">
            <div className="text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No documents found</h3>
              <p className="text-muted-foreground mb-6">
                Upload documents to train your AI assistant
              </p>
              <Button 
                className="gradient-primary"
                onClick={handleUploadClick}
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Uploading..." : "Upload Your First Document"}
              </Button>
            </div>
          </Card>
        ) : (
          documents.map((doc) => (
            <Card key={doc.id} className="p-6 border-0 shadow-lg hover:shadow-glow transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold truncate">{doc.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(doc.status || 'processing')}>
                        {doc.status || 'processing'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(doc)}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {doc.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {doc.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{doc.file_type?.toUpperCase()}</span>
                    <span>{formatFileSize(doc.size)}</span>
                  </div>
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {doc.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-3">
                    Uploaded {doc.uploaded_at && formatDistanceToNow(new Date(doc.uploaded_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Documents;
