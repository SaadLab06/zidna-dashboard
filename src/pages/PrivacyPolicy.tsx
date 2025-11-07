import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
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

        {/* Sections */}
        <div className="space-y-12 text-base">
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4 pb-2 border-b border-border">
              1. Introduction
            </h2>
            <p className="leading-relaxed text-foreground/90">
              Zidna Digital ("we," "us," "our," or the "Company") respects your privacy and is committed to protecting your personal data in accordance with Law No. 18-07 of June 10, 2018 on the Protection of Natural Persons in the Processing of Personal Data, international data protection principles, and Meta platform requirements.
            </p>
            <p className="leading-relaxed text-foreground/90">
              This Privacy Policy explains how we collect, use, store, share, and protect your information when you use Zidna Social Hub (the "Service"). This policy is incorporated into and forms part of our Terms of Service.
            </p>
            <p className="leading-relaxed text-foreground/90">
              By accessing or using the Service, you acknowledge that you have read and understood this Privacy Policy and consent to our data practices as described herein, subject to your rights under applicable data protection laws.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4 pb-2 border-b border-border">
              2. Information We Collect
            </h2>
            <p className="leading-relaxed text-foreground/90">
              We collect various types of information to provide, maintain, and improve our Service in compliance with Algerian data protection requirements.
            </p>

            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <h3 className="text-xl font-semibold">2.1 Information You Provide Directly</h3>
              
              <div>
                <p className="font-medium mb-2">Account Registration Data:</p>
                <ul className="space-y-1.5 ml-6 list-disc text-foreground/80">
                  <li>Email address (required for account creation and communications)</li>
                  <li>Password (encrypted using industry-standard algorithms)</li>
                  <li>Authentication data when using Google or Facebook login (OAuth tokens)</li>
                </ul>
              </div>

              <div>
                <p className="font-medium mb-2">Social Media Connection Data:</p>
                <ul className="space-y-1.5 ml-6 list-disc text-foreground/80">
                  <li>Facebook and Instagram access tokens (obtained through Meta's authorization process)</li>
                  <li>Connected social media account information (account IDs, page information)</li>
                  <li>Social media content metadata necessary for service functionality</li>
                </ul>
              </div>

              <div>
                <p className="font-medium mb-2">Configuration and Preferences:</p>
                <ul className="space-y-1.5 ml-6 list-disc text-foreground/80">
                  <li>AI settings (tone preferences, language selections)</li>
                  <li>Auto-reply toggle settings and automation preferences</li>
                  <li>Notification preferences and communication settings</li>
                  <li>User role assignments (Admin or Standard User)</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <h3 className="text-xl font-semibold">2.2 Information Collected Automatically</h3>
              
              <div>
                <p className="font-medium mb-2">Social Media Content:</p>
                <ul className="space-y-1.5 ml-6 list-disc text-foreground/80">
                  <li>Comments on your Facebook and Instagram posts</li>
                  <li>Direct messages (DMs) received on connected accounts</li>
                  <li>Post metadata necessary for providing automated responses</li>
                </ul>
              </div>

              <div>
                <p className="font-medium mb-2">Technical Data:</p>
                <ul className="space-y-1.5 ml-6 list-disc text-foreground/80">
                  <li>User ID and session information for security purposes</li>
                  <li>Log data including access times, features used, and system interactions</li>
                  <li>Error logs and performance metrics for service improvement</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <h3 className="text-xl font-semibold">2.3 AI-Generated Data</h3>
              
              <div>
                <p className="font-medium mb-2">AI Processing Information:</p>
                <ul className="space-y-1.5 ml-6 list-disc text-foreground/80">
                  <li>Text inputs provided to AI systems for response generation</li>
                  <li>AI-generated responses and suggestions</li>
                  <li>Tone and language customization data for personalization</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4 pb-2 border-b border-border">
              3. Legal Basis and Purposes for Processing
            </h2>
            <p className="leading-relaxed text-foreground/90">
              We process your personal data in accordance with Law No. 18-07 on Personal Data Protection based on the following legal grounds and purposes:
            </p>

            <div className="grid gap-6">
              <div className="space-y-3 p-4 rounded-lg bg-muted/30">
                <h3 className="text-lg font-semibold">3.1 Service Provision (Contractual Necessity and Consent)</h3>
                <ul className="space-y-1.5 ml-6 list-disc text-foreground/80">
                  <li>Create and manage your account</li>
                  <li>Authenticate your identity and maintain secure access</li>
                  <li>Connect your Facebook and Instagram accounts via Meta Graph API</li>
                  <li>Automate responses to comments and direct messages</li>
                  <li>Generate personalized AI responses based on your configurations</li>
                  <li>Provide role-based access control and user management</li>
                </ul>
              </div>

              <div className="space-y-3 p-4 rounded-lg bg-muted/30">
                <h3 className="text-lg font-semibold">3.2 Service Improvement (Legitimate Interests)</h3>
                <ul className="space-y-1.5 ml-6 list-disc text-foreground/80">
                  <li>Improve AI-generated content personalization</li>
                  <li>Enhance Service functionality and user experience</li>
                  <li>Develop new features and capabilities</li>
                  <li>Analyze usage patterns and optimize performance</li>
                </ul>
              </div>

              <div className="space-y-3 p-4 rounded-lg bg-muted/30">
                <h3 className="text-lg font-semibold">3.3 Communication (Contractual Necessity and Consent)</h3>
                <ul className="space-y-1.5 ml-6 list-disc text-foreground/80">
                  <li>Send Service-related notifications and updates</li>
                  <li>Respond to your inquiries and support requests</li>
                  <li>Notify you of changes to our Terms or Privacy Policy</li>
                </ul>
              </div>

              <div className="space-y-3 p-4 rounded-lg bg-muted/30">
                <h3 className="text-lg font-semibold">3.4 Security and Compliance (Legal Obligation and Legitimate Interests)</h3>
                <ul className="space-y-1.5 ml-6 list-disc text-foreground/80">
                  <li>Detect, prevent, and address technical issues</li>
                  <li>Protect against fraudulent, unauthorized, or illegal activity</li>
                  <li>Enforce our Terms of Service</li>
                  <li>Comply with legal obligations including ANPDP reporting requirements</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4 pb-2 border-b border-border">
              4. How We Share Your Information
            </h2>
            <p className="leading-relaxed text-foreground/90">
              We do not sell your personal data. We share your information only in the following circumstances, in compliance with Algerian data protection law:
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">4.1 Essential Service Providers</h3>
                <p className="mb-4 text-foreground/90">We share data with trusted third-party services necessary to operate the Service:</p>
                
                <div className="grid gap-4">
                  <div className="p-4 rounded-lg border border-border bg-card">
                    <p className="font-semibold mb-2">Meta Graph API (Facebook and Instagram):</p>
                    <ul className="space-y-1 ml-6 list-disc text-sm text-foreground/80">
                      <li>Access tokens for account authentication</li>
                      <li>Post content and metadata for automation features</li>
                      <li>Subject to Meta's Platform Terms and Data Policy</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg border border-border bg-card">
                    <p className="font-semibold mb-2">OpenAI API (Conditional AI Processing):</p>
                    <ul className="space-y-1 ml-6 list-disc text-sm text-foreground/80">
                      <li>AI text inputs for generating automated responses (only when enabled)</li>
                      <li>Subject to OpenAI's Data Processing Addendum and Privacy Policy</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg border border-border bg-card">
                    <p className="font-semibold mb-2">Supabase (Database and Authentication):</p>
                    <ul className="space-y-1 ml-6 list-disc text-sm text-foreground/80">
                      <li>Account data, authentication information, and secure database storage</li>
                      <li>Subject to Supabase's GDPR-compliant Data Processing Addendum</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg border border-border bg-card">
                    <p className="font-semibold mb-2">N8n (Backend Workflow Automation):</p>
                    <ul className="space-y-1 ml-6 list-disc text-sm text-foreground/80">
                      <li>Backend workflow data for automation processing</li>
                      <li>Subject to N8n's Privacy Policy and data processing agreements</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">4.2 Legal Requirements and Public Interest</h3>
                <p className="mb-3 text-foreground/90">We may disclose your information when required by Algerian law or in response to:</p>
                <ul className="space-y-1.5 ml-6 list-disc text-foreground/80">
                  <li>Valid legal processes (subpoenas, court orders, warrants) from Algerian authorities</li>
                  <li>Governmental or regulatory requests from ANPDP or other competent authorities</li>
                  <li>Protection of our rights, property, or safety, or that of others</li>
                  <li>Emergency situations involving potential harm or imminent danger</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">4.3 Business Transfers</h3>
                <p className="leading-relaxed text-foreground/90">
                  In the event of a merger, acquisition, reorganization, or sale of assets, your information may be transferred to the acquiring entity, subject to this Privacy Policy and applicable data protection law requirements, including ANPDP notification where required.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">4.4 With Your Explicit Consent</h3>
                <p className="leading-relaxed text-foreground/90">
                  We may share your information with additional third parties when you explicitly consent to such sharing, with the right to withdraw consent at any time.
                </p>
              </div>
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
              For questions, concerns, or to exercise your privacy rights, please contact us using the information above.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
