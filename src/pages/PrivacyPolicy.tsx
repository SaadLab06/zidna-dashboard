import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const DEFAULT_CONTENT = `# Privacy Policy

Effective Date: November 7, 2025

Last Updated: November 7, 2025

## 1. Introduction

Zidna Digital ("we," "us," "our," or the "Company") respects your privacy and is committed to protecting your personal data in accordance with Law No. 18-07 of June 10, 2018 on the Protection of Natural Persons in the Processing of Personal Data, international data protection principles, and Meta platform requirements.

This Privacy Policy explains how we collect, use, store, share, and protect your information when you use Zidna Social Hub (the "Service"). This policy is incorporated into and forms part of our Terms of Service.

By accessing or using the Service, you acknowledge that you have read and understood this Privacy Policy and consent to our data practices as described herein, subject to your rights under applicable data protection laws.

## 2. Information We Collect

We collect various types of information to provide, maintain, and improve our Service in compliance with Algerian data protection requirements.

### 2.1 Information You Provide Directly

**Account Registration Data:**
- Email address (required for account creation and communications)
- Password (encrypted using industry-standard algorithms)
- Authentication data when using Google or Facebook login (OAuth tokens)

**Social Media Connection Data:**
- Facebook and Instagram access tokens (obtained through Meta's authorization process)
- Connected social media account information (account IDs, page information)
- Social media content metadata necessary for service functionality

## Contact Information

**Company:** Zidna Digital  
**Privacy Email:** hello@zidnadigital.com  
**Address:** Av. du 1er Novembre, Ghardaïa - Algeria  
**Phone:** +213 563266253`;

const PrivacyPolicy = () => {
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
        .eq('document_type', 'privacy_policy')
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
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
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

export default PrivacyPolicy;
