import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsOfService = () => {
  const navigate = useNavigate();

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

        {/* Sections */}
        <div className="space-y-12 text-base">
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4 pb-2 border-b border-border">
              1. Introduction and Acceptance
            </h2>
            <p className="leading-relaxed text-foreground/90">
              Welcome to Zidna Social Hub (the "Service"), provided by Zidna Digital ("we," "us," "our," or the "Company"), an AI Automation Agency operating in Algeria under the laws of the People's Democratic Republic of Algeria.
            </p>
            <p className="leading-relaxed text-foreground/90">
              By accessing or using Zidna Social Hub, you ("User," "you," or "your") agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must not access or use the Service.
            </p>
            <p className="leading-relaxed text-foreground/90">
              These Terms constitute a legally binding agreement between you and Zidna Digital in accordance with Algerian Civil Code provisions and Law No. 18-05 of May 10, 2018 on Electronic Commerce. Your continued use of the Service following any modifications to these Terms constitutes acceptance of such changes.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4 pb-2 border-b border-border">
              2. Description of Service
            </h2>
            <p className="leading-relaxed text-foreground/90">
              Zidna Social Hub is a Software-as-a-Service (SaaS) dashboard designed to help business owners manage and automate social media interactions on Facebook and Instagram using artificial intelligence, in compliance with Meta's Developer Policies and platform terms.
            </p>

            <div className="p-4 rounded-lg bg-muted/30">
              <h3 className="text-lg font-semibold mb-3">Key Features Include:</h3>
              <ul className="space-y-1.5 ml-6 list-disc text-foreground/80">
                <li>Integration with Facebook and Instagram via Meta Graph API</li>
                <li>Secure token management for social media accounts</li>
                <li>AI-powered automated responses to comments and direct messages</li>
                <li>Customizable AI configurations (tone, language, auto-reply settings)</li>
                <li>Per-user settings and notification management</li>
                <li>Role-based access control (Admin and Standard User)</li>
              </ul>
            </div>

            <p className="leading-relaxed text-foreground/90">
              The Service is intended exclusively for business owners aged 18 years or older operating in compliance with applicable commercial laws and regulations.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4 pb-2 border-b border-border">
              3. Eligibility and Account Registration
            </h2>

            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <h3 className="text-xl font-semibold">3.1 Age Requirement</h3>
              <p className="leading-relaxed text-foreground/90">
                You must be at least 18 years of age to use this Service, in accordance with Algerian legal capacity requirements. By registering, you represent and warrant that you meet this age requirement and have the legal capacity to enter into binding contracts under Algerian law.
              </p>
            </div>

            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <h3 className="text-xl font-semibold">3.2 Account Creation</h3>
              <p className="mb-3 text-foreground/90">To access the Service, you must create an account using one of the following methods, in compliance with Law No. 18-07 on Personal Data Protection:</p>
              <ul className="space-y-1.5 ml-6 list-disc text-foreground/80">
                <li>Email and password</li>
                <li>Google authentication (OAuth)</li>
                <li>Facebook authentication (OAuth)</li>
              </ul>
              <p className="leading-relaxed text-foreground/90 mt-3">
                You agree to provide accurate, current, and complete information during registration and to update such information as necessary to maintain its accuracy.
              </p>
            </div>

            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <h3 className="text-xl font-semibold">3.3 Account Security</h3>
              <p className="mb-3 text-foreground/90">You are solely responsible for:</p>
              <ul className="space-y-1.5 ml-6 list-disc text-foreground/80">
                <li>Maintaining the confidentiality of your login credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized access or security breach</li>
              </ul>
            </div>

            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <h3 className="text-xl font-semibold">3.4 Account Roles</h3>
              <p className="mb-3 text-foreground/90">The Service supports multiple user roles with row-level security (RLS) filtering:</p>
              <ul className="space-y-1.5 ml-6 list-disc text-foreground/80">
                <li><strong>Admin:</strong> Full access to all features and settings</li>
                <li><strong>Standard User:</strong> Limited access based on assigned permissions</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4 pb-2 border-b border-border">
              4. User Responsibilities and Prohibited Conduct
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-3">4.1 Acceptable Use</h3>
                <p className="mb-3 text-foreground/90">You agree to use the Service only for lawful purposes and in accordance with these Terms and applicable Algerian laws, including but not limited to:</p>
                <ul className="space-y-1.5 ml-6 list-disc text-foreground/80">
                  <li>Keeping your login credentials confidential</li>
                  <li>Complying with all applicable local, national, and international laws</li>
                  <li>Respecting Meta's Platform Terms, Community Standards, and API policies</li>
                  <li>Using automation features responsibly and ethically</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                <h3 className="text-xl font-semibold mb-3 text-destructive">4.2 Prohibited Activities</h3>
                <p className="mb-3 text-foreground/90">You must NOT engage in any of the following activities, which may violate Algerian criminal law, commercial regulations, or platform policies:</p>
                <ul className="space-y-1.5 ml-6 list-disc text-foreground/80 text-sm">
                  <li>Post, transmit, or facilitate the distribution of illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable content</li>
                  <li>Use the Service to spam, impersonate others, or engage in deceptive practices</li>
                  <li>Misuse automation features to violate Meta's platform policies or engage in manipulative behavior</li>
                  <li>Attempt to gain unauthorized access to the Service, other users' accounts, or our systems</li>
                  <li>Reverse engineer, decompile, or attempt to extract source code from the Service</li>
                  <li>Use the Service in any manner that could damage, disable, or impair our infrastructure</li>
                  <li>Violate any third-party rights, including intellectual property, privacy, or publicity rights</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">4.3 Consequences of Violations</h3>
                <p className="mb-3 text-foreground/90">Violation of these Terms may result in, in accordance with Algerian commercial law and our contractual rights:</p>
                <ul className="space-y-1.5 ml-6 list-disc text-foreground/80">
                  <li>Immediate suspension or termination of your account</li>
                  <li>Legal action where appropriate under Algerian jurisdiction</li>
                  <li>Reporting to relevant authorities or platform providers (including Meta and ANPDP)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4 pb-2 border-b border-border">
              5. Intellectual Property Rights
            </h2>

            <div className="grid gap-6">
              <div className="p-4 rounded-lg bg-muted/30">
                <h3 className="text-lg font-semibold mb-3">5.1 Ownership of Service</h3>
                <p className="leading-relaxed text-foreground/90">
                  All rights, title, and interest in and to the Zidna Social Hub dashboard, including its code, design, features, functionality, and all related intellectual property rights, are and will remain the exclusive property of Zidna Digital under Algerian intellectual property law and international conventions to which Algeria is a party.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/30">
                <h3 className="text-lg font-semibold mb-3">5.2 Limited License to Use Service</h3>
                <p className="leading-relaxed text-foreground/90">
                  Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service solely for your internal business purposes in accordance with Algerian commercial law.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/30">
                <h3 className="text-lg font-semibold mb-3">5.3 User-Generated Content</h3>
                <p className="leading-relaxed text-foreground/90 mb-3">
                  You retain all ownership rights to content you create, upload, or publish through the Service ("User Content"). However, by using the Service, you grant us a limited, temporary license to:
                </p>
                <ul className="space-y-1.5 ml-6 list-disc text-foreground/80">
                  <li>Process your User Content for the purpose of providing the Service</li>
                  <li>Publish User Content to your connected Facebook and Instagram accounts on your behalf</li>
                  <li>Generate AI-powered responses based on your configurations</li>
                </ul>
                <p className="leading-relaxed text-foreground/90 mt-3 text-sm">
                  This license terminates when you delete the content or close your account, except where continued processing is required by law or for legitimate business purposes as defined under Algerian data protection law.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4 pb-2 border-b border-border">
              6. Third-Party Services and Integrations
            </h2>

            <div>
              <h3 className="text-xl font-semibold mb-3">6.1 Third-Party Dependencies</h3>
              <p className="mb-3 text-foreground/90">The Service integrates with and depends upon the following third-party services:</p>
              <div className="grid gap-2">
                <div className="p-3 rounded border border-border bg-card text-sm">
                  <strong>Meta Graph API:</strong> Facebook and Instagram integration
                </div>
                <div className="p-3 rounded border border-border bg-card text-sm">
                  <strong>Supabase:</strong> Database and authentication services (GDPR compliant with Data Processing Addendum)
                </div>
                <div className="p-3 rounded border border-border bg-card text-sm">
                  <strong>Lovable:</strong> Frontend development platform
                </div>
                <div className="p-3 rounded border border-border bg-card text-sm">
                  <strong>OpenAI API:</strong> AI text generation (with Data Processing Addendum)
                </div>
                <div className="p-3 rounded border border-border bg-card text-sm">
                  <strong>N8n:</strong> Backend workflow automation
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">6.2 Data Transmission</h3>
              <p className="mb-3 text-foreground/90">By using the Service, you acknowledge and agree that, in compliance with Law No. 18-07 on Personal Data Protection:</p>
              <ul className="space-y-1.5 ml-6 list-disc text-foreground/80">
                <li>Access tokens and post data are transmitted to Meta Graph API under appropriate data processing agreements</li>
                <li>AI-generated text may be processed through OpenAI API (if enabled) under their Data Processing Addendum</li>
                <li>Your data is processed in accordance with our Privacy Policy and applicable data protection laws</li>
                <li>International data transfers comply with ANPDP authorization requirements where applicable</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">6.3 Third-Party Terms</h3>
              <p className="mb-3 text-foreground/90">Your use of the Service is also subject to the terms and policies of these third-party providers:</p>
              <ul className="space-y-1.5 ml-6 list-disc text-foreground/80">
                <li>Meta Platform Terms and Policies</li>
                <li>OpenAI API Terms and Usage Policies</li>
                <li>Supabase Terms of Service and Privacy Policy</li>
                <li>N8n Privacy Policy and Terms of Service</li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4 pb-2 border-b border-border">
              7. Governing Law and Dispute Resolution
            </h2>

            <div className="p-6 rounded-lg border-2 border-primary/20 bg-primary/5">
              <h3 className="text-xl font-semibold mb-3">7.1 Governing Law</h3>
              <p className="leading-relaxed text-foreground/90">
                These Terms shall be governed by and construed in accordance with the laws of the People's Democratic Republic of Algeria, including the Algerian Civil Code and Commercial Code, without regard to conflict of law provisions.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">7.2 Jurisdiction and Venue</h3>
              <p className="leading-relaxed text-foreground/90">
                Any disputes arising from or relating to these Terms or the Service shall be subject to the exclusive jurisdiction of the specialized commercial courts of Ghardaïa, Algeria, or such other competent Algerian courts as determined by applicable law.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">7.3 Dispute Resolution Process</h3>
              <p className="mb-3 text-foreground/90">In accordance with Algerian civil procedure, disputes shall be resolved through the following process:</p>
              <ol className="space-y-2 ml-6 list-decimal text-foreground/80">
                <li><strong>Negotiation:</strong> Good faith negotiations for 30 days</li>
                <li><strong>Mediation:</strong> Court-proposed mediation if negotiations fail</li>
                <li><strong>Arbitration:</strong> Binding arbitration in Algiers under Algerian arbitration law (optional by mutual agreement)</li>
                <li><strong>Litigation:</strong> Algerian court proceedings as final resort</li>
              </ol>
            </div>
          </section>

          {/* Contact Section */}
          <section className="p-6 rounded-lg bg-primary/5 border border-primary/20">
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <div className="space-y-2 text-foreground/90">
              <p><strong>Company:</strong> Zidna Digital</p>
              <p><strong>Email:</strong> hello@zidnadigital.com</p>
              <p><strong>Address:</strong> Av. du 1er Novembre, Ghardaïa - Algeria</p>
              <p><strong>Phone:</strong> +213 563266253</p>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              For questions, concerns, or notices regarding these Terms, please contact us using the information above.
            </p>
          </section>

          <div className="p-4 rounded-lg bg-muted/50 border border-border text-center">
            <p className="text-sm text-foreground/80">
              By using Zidna Social Hub, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
