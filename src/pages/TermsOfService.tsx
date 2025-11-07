import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card className="p-8 border-0 shadow-lg">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
            <p className="text-muted-foreground mb-6">
              <strong>Effective Date:</strong> November 7, 2025<br />
              <strong>Last Updated:</strong> November 7, 2025
            </p>

            <h2>1. Introduction and Acceptance</h2>
            <p>
              Welcome to Zidna Social Hub (the "Service"), provided by Zidna Digital ("we," "us," "our," or the "Company"), an AI Automation Agency operating in Algeria under the laws of the People's Democratic Republic of Algeria.
            </p>
            <p>
              By accessing or using Zidna Social Hub, you ("User," "you," or "your") agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must not access or use the Service.
            </p>
            <p>
              These Terms constitute a legally binding agreement between you and Zidna Digital in accordance with Algerian Civil Code provisions and Law No. 18-05 of May 10, 2018 on Electronic Commerce. Your continued use of the Service following any modifications to these Terms constitutes acceptance of such changes.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              Zidna Social Hub is a Software-as-a-Service (SaaS) dashboard designed to help business owners manage and automate social media interactions on Facebook and Instagram using artificial intelligence, in compliance with Meta's Developer Policies and platform terms.
            </p>

            <h3>Key Features Include:</h3>
            <ul>
              <li>Integration with Facebook and Instagram via Meta Graph API</li>
              <li>Secure token management for social media accounts</li>
              <li>AI-powered automated responses to comments and direct messages</li>
              <li>Customizable AI configurations (tone, language, auto-reply settings)</li>
              <li>Per-user settings and notification management</li>
              <li>Role-based access control (Admin and Standard User)</li>
            </ul>

            <p>
              The Service is intended exclusively for business owners aged 18 years or older operating in compliance with applicable commercial laws and regulations.
            </p>

            <h2>3. Eligibility and Account Registration</h2>
            
            <h3>3.1 Age Requirement</h3>
            <p>
              You must be at least 18 years of age to use this Service, in accordance with Algerian legal capacity requirements. By registering, you represent and warrant that you meet this age requirement and have the legal capacity to enter into binding contracts under Algerian law.
            </p>

            <h3>3.2 Account Creation</h3>
            <p>To access the Service, you must create an account using one of the following methods, in compliance with Law No. 18-07 on Personal Data Protection:</p>
            <ul>
              <li>Email and password</li>
              <li>Google authentication (OAuth)</li>
              <li>Facebook authentication (OAuth)</li>
            </ul>
            <p>
              You agree to provide accurate, current, and complete information during registration and to update such information as necessary to maintain its accuracy.
            </p>

            <h3>3.3 Account Security</h3>
            <p>You are solely responsible for:</p>
            <ul>
              <li>Maintaining the confidentiality of your login credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access or security breach</li>
            </ul>

            <h3>3.4 Account Roles</h3>
            <p>The Service supports multiple user roles with row-level security (RLS) filtering:</p>
            <ul>
              <li><strong>Admin:</strong> Full access to all features and settings</li>
              <li><strong>Standard User:</strong> Limited access based on assigned permissions</li>
            </ul>

            <h2>4. User Responsibilities and Prohibited Conduct</h2>
            
            <h3>4.1 Acceptable Use</h3>
            <p>You agree to use the Service only for lawful purposes and in accordance with these Terms and applicable Algerian laws, including but not limited to:</p>
            <ul>
              <li>Keeping your login credentials confidential</li>
              <li>Complying with all applicable local, national, and international laws</li>
              <li>Respecting Meta's Platform Terms, Community Standards, and API policies</li>
              <li>Using automation features responsibly and ethically</li>
            </ul>

            <h3>4.2 Prohibited Activities</h3>
            <p>You must NOT engage in any of the following activities, which may violate Algerian criminal law, commercial regulations, or platform policies:</p>
            <ul>
              <li>Post, transmit, or facilitate the distribution of illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable content</li>
              <li>Use the Service to spam, impersonate others, or engage in deceptive practices</li>
              <li>Misuse automation features to violate Meta's platform policies or engage in manipulative behavior</li>
              <li>Attempt to gain unauthorized access to the Service, other users' accounts, or our systems</li>
              <li>Reverse engineer, decompile, or attempt to extract source code from the Service</li>
              <li>Use the Service in any manner that could damage, disable, or impair our infrastructure</li>
              <li>Violate any third-party rights, including intellectual property, privacy, or publicity rights</li>
            </ul>

            <h3>4.3 Consequences of Violations</h3>
            <p>Violation of these Terms may result in, in accordance with Algerian commercial law and our contractual rights:</p>
            <ul>
              <li>Immediate suspension or termination of your account</li>
              <li>Legal action where appropriate under Algerian jurisdiction</li>
              <li>Reporting to relevant authorities or platform providers (including Meta and ANPDP)</li>
            </ul>

            <h2>5. Intellectual Property Rights</h2>
            
            <h3>5.1 Ownership of Service</h3>
            <p>
              All rights, title, and interest in and to the Zidna Social Hub dashboard, including its code, design, features, functionality, and all related intellectual property rights, are and will remain the exclusive property of Zidna Digital under Algerian intellectual property law and international conventions to which Algeria is a party.
            </p>

            <h3>5.2 Limited License to Use Service</h3>
            <p>
              Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service solely for your internal business purposes in accordance with Algerian commercial law.
            </p>

            <h3>5.3 User-Generated Content</h3>
            <p>
              You retain all ownership rights to content you create, upload, or publish through the Service ("User Content"). However, by using the Service, you grant us a limited, temporary license to:
            </p>
            <ul>
              <li>Process your User Content for the purpose of providing the Service</li>
              <li>Publish User Content to your connected Facebook and Instagram accounts on your behalf</li>
              <li>Generate AI-powered responses based on your configurations</li>
            </ul>
            <p>
              This license terminates when you delete the content or close your account, except where continued processing is required by law or for legitimate business purposes as defined under Algerian data protection law.
            </p>

            <h2>6. Third-Party Services and Integrations</h2>
            
            <h3>6.1 Third-Party Dependencies</h3>
            <p>The Service integrates with and depends upon the following third-party services:</p>
            <ul>
              <li><strong>Meta Graph API:</strong> Facebook and Instagram integration</li>
              <li><strong>Supabase:</strong> Database and authentication services (GDPR compliant with Data Processing Addendum)</li>
              <li><strong>Lovable:</strong> Frontend development platform</li>
              <li><strong>OpenAI API:</strong> AI text generation (with Data Processing Addendum)</li>
              <li><strong>N8n:</strong> Backend workflow automation</li>
            </ul>

            <h3>6.2 Data Transmission</h3>
            <p>By using the Service, you acknowledge and agree that, in compliance with Law No. 18-07 on Personal Data Protection:</p>
            <ul>
              <li>Access tokens and post data are transmitted to Meta Graph API under appropriate data processing agreements</li>
              <li>AI-generated text may be processed through OpenAI API (if enabled) under their Data Processing Addendum</li>
              <li>Your data is processed in accordance with our Privacy Policy and applicable data protection laws</li>
              <li>International data transfers comply with ANPDP authorization requirements where applicable</li>
            </ul>

            <h3>6.3 Third-Party Terms</h3>
            <p>Your use of the Service is also subject to the terms and policies of these third-party providers:</p>
            <ul>
              <li>Meta Platform Terms and Policies</li>
              <li>OpenAI API Terms and Usage Policies</li>
              <li>Supabase Terms of Service and Privacy Policy</li>
              <li>N8n Privacy Policy and Terms of Service</li>
            </ul>

            <h2>7. Payment Terms</h2>
            
            <h3>7.1 Pricing Structure</h3>
            <p>
              The Service operates on a subscription-based model. Detailed pricing information is available on our website and may be updated from time to time with reasonable notice to users.
            </p>

            <h3>7.2 Payment Processing</h3>
            <p>
              Payments are processed through secure, third-party payment processors in compliance with Algerian e-commerce regulations and international security standards. All payment information is encrypted and processed securely.
            </p>

            <h3>7.3 Billing and Automatic Renewal</h3>
            <p>
              Subscription fees are billed in advance on a monthly or annual basis as selected during subscription. Unless cancelled before the renewal date, subscriptions automatically renew for successive periods of the same duration.
            </p>

            <h3>7.4 Refund Policy</h3>
            <p>
              Refunds may be provided at our discretion for unused portions of prepaid subscription fees, in accordance with Algerian consumer protection laws and our published refund policy available on our website.
            </p>

            <h3>7.5 Taxes</h3>
            <p>
              You are responsible for all applicable taxes, duties, and governmental charges associated with your use of the Service, including VAT and other taxes as required under Algerian tax law.
            </p>

            <h2>8. Service Availability and Modifications</h2>
            
            <h3>8.1 "As Is" Provision</h3>
            <p>
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis, subject to the limitations permitted under Algerian commercial law. We make commercially reasonable efforts regarding:
            </p>
            <ul>
              <li>Service uptime and availability (target: 99.5% monthly uptime)</li>
              <li>Performance, speed, and reliability</li>
              <li>Compatibility with standard web browsers and devices</li>
              <li>Prompt resolution of technical issues</li>
            </ul>

            <h3>8.2 Service Modifications</h3>
            <p>We reserve the right to:</p>
            <ul>
              <li>Modify, suspend, or discontinue any aspect of the Service with reasonable notice</li>
              <li>Impose reasonable limits on certain features or restrict access to parts of the Service</li>
              <li>Update or change these Terms with appropriate notice as provided herein</li>
            </ul>

            <h3>8.3 Maintenance and Downtime</h3>
            <p>
              We may perform scheduled or emergency maintenance that temporarily interrupts access to the Service. We will make reasonable efforts to notify you of planned maintenance at least 24 hours in advance when feasible.
            </p>

            <h2>9. Limitation of Liability</h2>
            
            <h3>9.1 Scope of Liability Limitations</h3>
            <p>
              To the maximum extent permitted by Algerian law and subject to mandatory consumer protection provisions, Zidna Digital's liability is limited as follows:
            </p>

            <h3>9.2 Third-Party Service Limitations</h3>
            <p>We shall not be liable for:</p>
            <ul>
              <li>Outages, restrictions, or changes to Meta's APIs or platform policies</li>
              <li>Data loss, corruption, or unauthorized access caused by third-party integrations</li>
              <li>Failures or interruptions of Supabase, OpenAI, N8n, or any other third-party service</li>
              <li>Actions taken by Meta or other platforms against your social media accounts</li>
            </ul>

            <h3>9.3 Damage Limitations</h3>
            <p>
              Subject to mandatory Algerian law provisions, our total liability shall not exceed the fees paid by you in the 12 months preceding the claim, and we shall not be liable for indirect, incidental, special, consequential, or punitive damages except where such limitation is prohibited by law.
            </p>

            <h2>10. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless Zidna Digital, its officers, directors, employees, agents, and affiliates from and against any claims, liabilities, damages, losses, costs, or expenses (including reasonable attorneys' fees) arising out of or related to:
            </p>
            <ul>
              <li>Your use or misuse of the Service</li>
              <li>Your violation of these Terms or applicable laws</li>
              <li>Your violation of any third-party rights</li>
              <li>Content you post or transmit through the Service</li>
              <li>Your failure to comply with Algerian data protection requirements</li>
            </ul>

            <h2>11. Data Security and Protection</h2>
            
            <h3>11.1 Security Measures</h3>
            <p>In compliance with Law No. 18-07 on Personal Data Protection, we implement appropriate technical and organizational security measures, including:</p>
            <ul>
              <li>AES-256 encryption for data at rest and TLS 1.3 for data in transit</li>
              <li>Secure storage of access tokens in Supabase with restricted access controls</li>
              <li>User authentication managed through Supabase security protocols</li>
              <li>HTTPS encryption for all dashboard traffic</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Multi-factor authentication options for enhanced account security</li>
            </ul>

            <h3>11.2 Data Processing Registration</h3>
            <p>
              We maintain all required registrations and declarations with the National Authority for Personal Data Protection (ANPDP) as required under Algerian law.
            </p>

            <h3>11.3 Breach Notification</h3>
            <p>
              In the event of a personal data breach, we will notify the ANPDP and affected users without undue delay and within 72 hours where feasible, in accordance with legal requirements.
            </p>

            <h2>12. Privacy and Data Protection Compliance</h2>
            <p>
              Your privacy is fundamental to our operations. Our collection, use, and protection of your personal data is governed by our Privacy Policy, which fully complies with:
            </p>
            <ul>
              <li>Law No. 18-07 of June 10, 2018 on Personal Data Protection</li>
              <li>Law No. 18-05 of May 10, 2018 on Electronic Commerce</li>
              <li>GDPR principles for international data transfers</li>
              <li>Meta's data sharing and platform policies</li>
            </ul>
            <p>
              Key data practices include collection of email addresses and authentication data during signup, storage of access tokens and social media content, processing of data to provide automated responses, and sharing of limited data with service providers as necessary for service provision.
            </p>

            <h2>13. Account Deletion and Termination</h2>
            
            <h3>13.1 Your Right to Terminate</h3>
            <p>
              You may stop using the Service and request account deletion at any time by contacting us at hello@zidnadigital.com. We will process deletion requests in accordance with Algerian data protection law and your data subject rights.
            </p>

            <h3>13.2 Our Right to Terminate</h3>
            <p>We reserve the right to suspend or terminate your access with reasonable notice, except for violations requiring immediate action, for:</p>
            <ul>
              <li>Material breach of these Terms</li>
              <li>Fraudulent or illegal activity</li>
              <li>Extended periods of inactivity (12+ months)</li>
              <li>Business or operational reasons with 30 days' notice</li>
            </ul>

            <h3>13.3 Effect of Termination</h3>
            <p>
              Upon termination, your access ceases immediately, and we will delete your account data in accordance with our data retention policies and legal obligations, typically within 30 days unless longer retention is required by law.
            </p>

            <h2>14. Modifications to Terms</h2>
            
            <h3>14.1 Right to Modify</h3>
            <p>
              We reserve the right to modify these Terms with reasonable notice. Material changes will be effective 30 days after notice, while non-material changes may be effective immediately upon posting.
            </p>

            <h3>14.2 Notification Methods</h3>
            <p>We will notify you of changes through:</p>
            <ul>
              <li>Email communication to your registered email address</li>
              <li>Dashboard notifications within the Service</li>
              <li>Posting updates on our website at zidnadigital.com</li>
            </ul>

            <h3>14.3 Acceptance of Changes</h3>
            <p>
              Your continued use of the Service following the effective date of modifications constitutes your acceptance of the revised Terms. If you do not agree to the modified Terms, you must discontinue use of the Service.
            </p>

            <h2>15. Governing Law and Dispute Resolution</h2>
            
            <h3>15.1 Governing Law</h3>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the People's Democratic Republic of Algeria, including the Algerian Civil Code and Commercial Code, without regard to conflict of law provisions.
            </p>

            <h3>15.2 Jurisdiction and Venue</h3>
            <p>
              Any disputes arising from or relating to these Terms or the Service shall be subject to the exclusive jurisdiction of the specialized commercial courts of Ghardaïa, Algeria, or such other competent Algerian courts as determined by applicable law.
            </p>

            <h3>15.3 Dispute Resolution Process</h3>
            <p>In accordance with Algerian civil procedure, disputes shall be resolved through the following process:</p>
            <ul>
              <li><strong>Negotiation:</strong> Good faith negotiations for 30 days</li>
              <li><strong>Mediation:</strong> Court-proposed mediation if negotiations fail</li>
              <li><strong>Arbitration:</strong> Binding arbitration in Algiers under Algerian arbitration law (optional by mutual agreement)</li>
              <li><strong>Litigation:</strong> Algerian court proceedings as final resort</li>
            </ul>

            <h3>15.4 Limitation Period</h3>
            <p>
              Any claim arising from these Terms or the Service must be filed within 15 years from the date the cause of action arose, as provided under Algerian civil law, unless a shorter specific limitation period applies.
            </p>

            <h2>16. Miscellaneous Provisions</h2>
            
            <h3>16.1 Entire Agreement</h3>
            <p>
              These Terms, together with our Privacy Policy and any additional service-specific terms, constitute the entire agreement between you and Zidna Digital regarding the Service and supersede all prior agreements and understandings.
            </p>

            <h3>16.2 Severability</h3>
            <p>
              If any provision of these Terms is found to be invalid or unenforceable under Algerian law, the remaining provisions will remain in full force and effect, and the invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable.
            </p>

            <h3>16.3 Assignment</h3>
            <p>
              You may not assign or transfer these Terms or your account without our prior written consent. We may assign these Terms in connection with a merger, acquisition, or sale of assets with reasonable notice to you.
            </p>

            <h3>16.4 Force Majeure</h3>
            <p>
              We shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, pandemics, government actions, or infrastructure failures, as recognized under Algerian law.
            </p>

            <h3>16.5 Language</h3>
            <p>
              These Terms are provided in English with Arabic translation available upon request. In the event of any conflict between the English version and any translation, the English version shall prevail, except where Arabic is required by Algerian law.
            </p>

            <h2>17. Contact Information</h2>
            <p>For questions, concerns, or notices regarding these Terms or the Service, please contact us at:</p>

            <div className="bg-muted p-4 rounded-lg my-4">
              <p className="font-semibold mb-2">Zidna Digital</p>
              <p><strong>Email:</strong> hello@zidnadigital.com</p>
              <p><strong>Address:</strong> Zidna Digital, Av. du 1er Novembre, Ghardaïa - Algeria</p>
              <p><strong>Phone:</strong> +213 563266253</p>
              <p><strong>Business Registration:</strong> Registered under Algerian commercial law</p>
            </div>

            <p className="mt-6">
              <strong>By using Zidna Social Hub, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</strong>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
