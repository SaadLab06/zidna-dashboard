import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Edit, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const DEFAULT_CONTENT = `# Terms of Service

Effective Date: November 7, 2025

Last Updated: November 7, 2025

## 1. Introduction and Acceptance

Welcome to Zidna Social Hub (the "Service"), provided by Zidna Digital ("we," "us," "our," or the "Company"), an AI Automation Agency operating in Algeria under the laws of the People's Democratic Republic of Algeria.

By accessing or using Zidna Social Hub, you ("User," "you," or "your") agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must not access or use the Service.

These Terms constitute a legally binding agreement between you and Zidna Digital in accordance with Algerian Civil Code provisions and Law No. 18-05 of May 10, 2018 on Electronic Commerce. Your continued use of the Service following any modifications to these Terms constitutes acceptance of such changes.

## 2. Description of Service

Zidna Social Hub is a Software-as-a-Service (SaaS) dashboard designed to help business owners manage and automate social media interactions on Facebook and Instagram using artificial intelligence, in compliance with Meta's Developer Policies and platform terms.

### Key Features Include:

- Integration with Facebook and Instagram via Meta Graph API
- Secure token management for social media accounts
- AI-powered automated responses to comments and direct messages
- Customizable AI configurations (tone, language, auto-reply settings)
- Per-user settings and notification management
- Role-based access control (Admin and Standard User)

The Service is intended exclusively for business owners aged 18 years or older operating in compliance with applicable commercial laws and regulations.

## Contact Information

**Company:** Zidna Digital  
**Email:** hello@zidnadigital.com  
**Address:** Av. du 1er Novembre, Ghardaïa - Algeria  
**Phone:** +213 563266253`;

const TermsOfService = () => {
  const navigate = useNavigate();
  const { isAdmin, isSuperAdmin } = useUserRole();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [editedContent, setEditedContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const canEdit = isAdmin || isSuperAdmin || userEmail === "saadlabri123@gmail.com";

  useEffect(() => {
    loadContent();
    supabase.auth.getUser().then(({ data: { user } }) => setUserEmail(user?.email ?? null));
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('content')
        .eq('document_type', 'terms_of_service')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading content:', error);
      } else if (data) {
        setContent(data.content);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditedContent(content);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent("");
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save changes.",
          variant: "destructive",
        });
        return;
      }

      const { error: upsertError } = await supabase
        .from('legal_documents')
        .upsert({
          document_type: 'terms_of_service',
          content: editedContent,
          updated_by: user.id,
        }, {
          onConflict: 'document_type'
        });

      if (upsertError) throw upsertError;

      setContent(editedContent);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Terms of Service updated successfully.",
      });
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/80 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          {canEdit && (
            <div className="flex gap-2">
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {isEditing ? (
          <div className="space-y-4">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl bg-primary/10">
                <Edit className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold tracking-tight mb-2">Edit Terms of Service</h1>
                <p className="text-sm text-muted-foreground">
                  Make changes to the terms of service document. Use Markdown for formatting.
                </p>
              </div>
            </div>
            
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[600px] font-mono text-sm"
              placeholder="Enter terms of service content..."
            />
          </div>
        ) : (
          <>
            {/* Title Section */}
            <div className="mb-12">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-xl bg-primary/10">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold tracking-tight mb-2">Terms of Service</h1>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span><strong>Effective:</strong> November 7, 2025</span>
                    <span><strong>Updated:</strong> November 7, 2025</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rendered Content */}
<div className="prose prose-neutral dark:prose-invert max-w-none">
  <ReactMarkdown remarkPlugins={[remarkGfm]}>
    {content}
  </ReactMarkdown>
</div>
          </>
        )}
      </div>
    </div>
  );
};

export default TermsOfService;
