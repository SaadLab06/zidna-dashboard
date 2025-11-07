import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
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
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
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
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
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
      </div>
    </div>
  );
};

export default TermsOfService;
