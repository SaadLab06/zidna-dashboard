import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
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
            <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground mb-6">
              <strong>Effective Date:</strong> November 7, 2025<br />
              <strong>Last Updated:</strong> November 7, 2025
            </p>

            <h2>1. Introduction</h2>
            <p>
              Zidna Digital ("we," "us," "our," or the "Company") respects your privacy and is committed to protecting your personal data in accordance with Law No. 18-07 of June 10, 2018 on the Protection of Natural Persons in the Processing of Personal Data, international data protection principles, and Meta platform requirements.
            </p>
            <p>
              This Privacy Policy explains how we collect, use, store, share, and protect your information when you use Zidna Social Hub (the "Service"). This policy is incorporated into and forms part of our Terms of Service.
            </p>
            <p>
              By accessing or using the Service, you acknowledge that you have read and understood this Privacy Policy and consent to our data practices as described herein, subject to your rights under applicable data protection laws.
            </p>

            <h2>2. Information We Collect</h2>
            <p>
              We collect various types of information to provide, maintain, and improve our Service in compliance with Algerian data protection requirements.
            </p>

            <h3>2.1 Information You Provide Directly</h3>
            <p><strong>Account Registration Data:</strong></p>
            <ul>
              <li>Email address (required for account creation and communications)</li>
              <li>Password (encrypted using industry-standard algorithms)</li>
              <li>Authentication data when using Google or Facebook login (OAuth tokens)</li>
            </ul>

            <p><strong>Social Media Connection Data:</strong></p>
            <ul>
              <li>Facebook and Instagram access tokens (obtained through Meta's authorization process)</li>
              <li>Connected social media account information (account IDs, page information)</li>
              <li>Social media content metadata necessary for service functionality</li>
            </ul>

            <p><strong>Configuration and Preferences:</strong></p>
            <ul>
              <li>AI settings (tone preferences, language selections)</li>
              <li>Auto-reply toggle settings and automation preferences</li>
              <li>Notification preferences and communication settings</li>
              <li>User role assignments (Admin or Standard User)</li>
            </ul>

            <h3>2.2 Information Collected Automatically</h3>
            <p><strong>Social Media Content:</strong></p>
            <ul>
              <li>Comments on your Facebook and Instagram posts</li>
              <li>Direct messages (DMs) received on connected accounts</li>
              <li>Post metadata necessary for providing automated responses</li>
            </ul>

            <p><strong>Technical Data:</strong></p>
            <ul>
              <li>User ID and session information for security purposes</li>
              <li>Log data including access times, features used, and system interactions</li>
              <li>Error logs and performance metrics for service improvement</li>
            </ul>

            <h3>2.3 AI-Generated Data</h3>
            <p><strong>AI Processing Information:</strong></p>
            <ul>
              <li>Text inputs provided to AI systems for response generation</li>
              <li>AI-generated responses and suggestions</li>
              <li>Tone and language customization data for personalization</li>
            </ul>

            <h2>3. Legal Basis and Purposes for Processing</h2>
            <p>
              We process your personal data in accordance with Law No. 18-07 on Personal Data Protection based on the following legal grounds and purposes:
            </p>

            <h3>3.1 Service Provision (Contractual Necessity and Consent)</h3>
            <ul>
              <li>Create and manage your account</li>
              <li>Authenticate your identity and maintain secure access</li>
              <li>Connect your Facebook and Instagram accounts via Meta Graph API</li>
              <li>Automate responses to comments and direct messages</li>
              <li>Generate personalized AI responses based on your configurations</li>
              <li>Provide role-based access control and user management</li>
            </ul>

            <h3>3.2 Service Improvement (Legitimate Interests)</h3>
            <ul>
              <li>Improve AI-generated content personalization</li>
              <li>Enhance Service functionality and user experience</li>
              <li>Develop new features and capabilities</li>
              <li>Analyze usage patterns and optimize performance</li>
            </ul>

            <h3>3.3 Communication (Contractual Necessity and Consent)</h3>
            <ul>
              <li>Send Service-related notifications and updates</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Notify you of changes to our Terms or Privacy Policy</li>
            </ul>

            <h3>3.4 Security and Compliance (Legal Obligation and Legitimate Interests)</h3>
            <ul>
              <li>Detect, prevent, and address technical issues</li>
              <li>Protect against fraudulent, unauthorized, or illegal activity</li>
              <li>Enforce our Terms of Service</li>
              <li>Comply with legal obligations including ANPDP reporting requirements</li>
            </ul>

            <h2>4. How We Share Your Information</h2>
            <p>
              We do not sell your personal data. We share your information only in the following circumstances, in compliance with Algerian data protection law:
            </p>

            <h3>4.1 Essential Service Providers</h3>
            <p>We share data with trusted third-party services necessary to operate the Service:</p>

            <p><strong>Meta Graph API (Facebook and Instagram):</strong></p>
            <ul>
              <li>Access tokens for account authentication</li>
              <li>Post content and metadata for automation features</li>
              <li>Subject to Meta's Platform Terms and Data Policy</li>
            </ul>

            <p><strong>OpenAI API (Conditional AI Processing):</strong></p>
            <ul>
              <li>AI text inputs for generating automated responses (only when enabled)</li>
              <li>Subject to OpenAI's Data Processing Addendum and Privacy Policy</li>
            </ul>

            <p><strong>Supabase (Database and Authentication):</strong></p>
            <ul>
              <li>Account data, authentication information, and secure database storage</li>
              <li>Subject to Supabase's GDPR-compliant Data Processing Addendum</li>
            </ul>

            <p><strong>N8n (Backend Workflow Automation):</strong></p>
            <ul>
              <li>Backend workflow data for automation processing</li>
              <li>Subject to N8n's Privacy Policy and data processing agreements</li>
            </ul>

            <h3>4.2 Legal Requirements and Public Interest</h3>
            <p>We may disclose your information when required by Algerian law or in response to:</p>
            <ul>
              <li>Valid legal processes (subpoenas, court orders, warrants) from Algerian authorities</li>
              <li>Governmental or regulatory requests from ANPDP or other competent authorities</li>
              <li>Protection of our rights, property, or safety, or that of others</li>
              <li>Emergency situations involving potential harm or imminent danger</li>
            </ul>

            <h3>4.3 Business Transfers</h3>
            <p>
              In the event of a merger, acquisition, reorganization, or sale of assets, your information may be transferred to the acquiring entity, subject to this Privacy Policy and applicable data protection law requirements, including ANPDP notification where required.
            </p>

            <h3>4.4 With Your Explicit Consent</h3>
            <p>
              We may share your information with additional third parties when you explicitly consent to such sharing, with the right to withdraw consent at any time.
            </p>

            <h2>5. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than Algeria, in compliance with Article 44 and 45 of Law No. 18-07 regarding international data transfers:
            </p>

            <h3>5.1 Transfer Destinations</h3>
            <ul>
              <li>United States: OpenAI servers, Supabase infrastructure</li>
              <li>European Union: Various cloud infrastructure providers</li>
              <li>Other Countries: Meta global infrastructure, N8n processing locations</li>
            </ul>

            <h3>5.2 Adequacy and Safeguards</h3>
            <p>We ensure appropriate protection through:</p>
            <ul>
              <li>ANPDP Authorization: Required authorizations obtained for transfers as mandated by Algerian law</li>
              <li>Standard Contractual Clauses: EU-approved clauses with service providers</li>
              <li>Data Processing Addenda: Comprehensive agreements with all processors</li>
              <li>Adequacy Assessments: Regular evaluation of destination country protections</li>
              <li>Technical Safeguards: Encryption in transit and at rest for all transfers</li>
            </ul>

            <h3>5.3 Transfer Restrictions</h3>
            <p>
              In accordance with Algerian law, transfers are prohibited when they would threaten public security or vital interests of Algeria, and all transfers undergo security assessment before authorization.
            </p>

            <h2>6. Data Retention and Storage</h2>
            <p>
              We retain your personal data only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, in compliance with Article 9 of Law No. 18-07 and applicable legal requirements:
            </p>

            <h3>6.1 Specific Retention Periods</h3>
            <ul>
              <li>Account Data: Retained while your account is active and for 90 days after account closure</li>
              <li>Access Tokens: 60 days from the time of refresh or revocation</li>
              <li>Social Media Comments: 6 months from collection date</li>
              <li>Direct Messages: Retained until user deletion or account closure</li>
              <li>AI Configurations: Retained until user deletion or account closure</li>
              <li>Log Data: 365 days for security and performance analysis</li>
              <li>Legal and Compliance Records: As required by Algerian law (typically 5-10 years)</li>
            </ul>

            <h3>6.2 Secure Deletion</h3>
            <p>When data is no longer needed, we securely delete or anonymize it using industry-standard methods, including:</p>
            <ul>
              <li>Cryptographic erasure for encrypted data</li>
              <li>Overwriting for unencrypted data storage</li>
              <li>Physical destruction of hardware containing sensitive data</li>
            </ul>

            <h2>7. Data Security</h2>
            <p>
              We implement comprehensive security measures to protect your information from unauthorized access, disclosure, alteration, and destruction, in accordance with Algerian data protection law requirements:
            </p>

            <h3>7.1 Technical Security Measures</h3>
            <ul>
              <li>Encryption: TLS 1.3 for data in transit, AES-256 for data at rest</li>
              <li>Access Controls: Multi-factor authentication, role-based access, principle of least privilege</li>
              <li>Network Security: Firewalls, intrusion detection, regular security monitoring</li>
              <li>Database Security: Encrypted storage, access logging, regular security updates</li>
              <li>Token Management: Secure token storage in Supabase with restricted access</li>
            </ul>

            <h3>7.2 Organizational Security Measures</h3>
            <ul>
              <li>Staff Training: Regular privacy and security training for all personnel</li>
              <li>Access Management: Limited access on need-to-know basis</li>
              <li>Incident Response: Documented procedures for security breaches</li>
              <li>Regular Audits: Periodic security assessments and vulnerability testing</li>
            </ul>

            <h3>7.3 Breach Response</h3>
            <p>In the event of a personal data breach, we will:</p>
            <ul>
              <li>Notify ANPDP within 72 hours of becoming aware of the breach</li>
              <li>Notify affected users without undue delay where the breach poses high risk</li>
              <li>Document the breach and remediation steps taken</li>
              <li>Implement additional security measures to prevent recurrence</li>
            </ul>

            <h3>7.4 Your Security Responsibilities</h3>
            <p>You are responsible for:</p>
            <ul>
              <li>Maintaining strong, unique passwords</li>
              <li>Securing devices used to access the Service</li>
              <li>Promptly reporting suspected security breaches</li>
              <li>Not sharing account credentials with others</li>
            </ul>

            <h2>8. Your Privacy Rights</h2>
            <p>
              Under Law No. 18-07 on Personal Data Protection, you have the following rights regarding your personal data:
            </p>

            <h3>8.1 Access and Information Rights</h3>
            <ul>
              <li>Right to Information: Receive clear information about our data practices</li>
              <li>Right to Access: Request a copy of the personal data we hold about you</li>
              <li>Right to Data Portability: Receive your data in a structured, machine-readable format</li>
            </ul>

            <h3>8.2 Correction and Control Rights</h3>
            <ul>
              <li>Right to Rectification: Request correction of inaccurate or incomplete data</li>
              <li>Right to Erasure: Request deletion of your personal data under certain circumstances</li>
              <li>Right to Object: Object to processing based on legitimate interests</li>
              <li>Right to Restrict Processing: Request limitation of how we process your data</li>
            </ul>

            <h3>8.3 Consent Management</h3>
            <ul>
              <li>Right to Withdraw Consent: Withdraw previously given consent at any time</li>
              <li>Granular Consent: Provide or withdraw consent for specific processing activities</li>
            </ul>

            <h3>8.4 Complaint Rights</h3>
            <ul>
              <li>Right to Lodge a Complaint: File complaints with ANPDP regarding our data practices</li>
              <li>Right to Judicial Remedy: Seek legal remedies through Algerian courts</li>
            </ul>

            <h3>8.5 Exercising Your Rights</h3>
            <p>To exercise any of these rights:</p>
            <ul>
              <li>Contact Us: Send requests to hello@zidnadigital.com</li>
              <li>Response Time: We will respond within 30 days (extendable to 90 days for complex requests)</li>
              <li>Identity Verification: We may require verification of your identity before processing requests</li>
              <li>No Fee: Exercising your rights is free, except for manifestly unfounded or excessive requests</li>
            </ul>

            <h2>9. Cookies and Tracking Technologies</h2>
            <p>
              Currently, the Zidna Social Hub Service uses minimal tracking technologies. We may implement the following types of cookies and tracking in the future:
            </p>

            <h3>9.1 Types of Cookies</h3>
            <ul>
              <li>Essential Cookies: Necessary for the Service to function (session management, security)</li>
              <li>Performance Cookies: Help us understand Service usage and performance</li>
              <li>Functional Cookies: Remember your preferences and settings</li>
              <li>Analytics Cookies: Collect information about Service usage patterns</li>
            </ul>

            <h3>9.2 Cookie Control</h3>
            <p>You can control cookies through:</p>
            <ul>
              <li>Browser settings to accept, reject, or delete cookies</li>
              <li>Our cookie preference center (when implemented)</li>
              <li>Third-party opt-out tools for analytics cookies</li>
            </ul>
            <p><em>Note: Disabling certain cookies may affect Service functionality.</em></p>

            <h2>10. Children's Privacy</h2>
            <p>
              The Service is not intended for use by individuals under 18 years of age, in accordance with Algerian legal capacity requirements and international best practices.
            </p>

            <h3>10.1 No Collection from Children</h3>
            <p>
              We do not knowingly collect personal data from children under 18. Our registration process includes age verification mechanisms.
            </p>

            <h3>10.2 Inadvertent Collection</h3>
            <p>If we become aware that we have collected personal data from a child under 18 without appropriate consent:</p>
            <ul>
              <li>We will delete such information as quickly as possible</li>
              <li>We will notify ANPDP if required by law</li>
              <li>We will implement additional safeguards to prevent future occurrences</li>
            </ul>

            <h3>10.3 Parental Rights</h3>
            <p>
              If you believe we have inadvertently collected information from a child under 18, please contact us immediately at hello@zidnadigital.com with relevant details.
            </p>

            <h2>11. Third-Party Links and Services</h2>
            <p>
              The Service may contain links to third-party websites, services, or resources not operated by us. We are not responsible for the privacy practices of these third parties.
            </p>

            <h3>11.1 Third-Party Privacy Policies</h3>
            <p>We recommend reviewing the privacy policies of:</p>
            <ul>
              <li>Meta Platform Terms and Privacy Policies</li>
              <li>OpenAI Privacy Policy</li>
              <li>Supabase Privacy Policy</li>
              <li>N8n Privacy Policy</li>
            </ul>

            <h3>11.2 Limited Scope</h3>
            <p>
              This Privacy Policy applies only to information collected through the Zidna Social Hub Service and does not apply to information collected by third parties through their own services or websites.
            </p>

            <h2>12. Changes to This Privacy Policy</h2>
            
            <h3>12.1 Right to Modify</h3>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices, legal requirements, or Service features, in compliance with Algerian notification requirements.
            </p>

            <h3>12.2 Notification Methods</h3>
            <p>We will notify you of material changes through:</p>
            <ul>
              <li>Email Notification: Sent to your registered email address at least 30 days before changes take effect</li>
              <li>Dashboard Notifications: Prominent notices within the Service interface</li>
              <li>Website Updates: Posting the updated Privacy Policy with a revised "Last Updated" date</li>
              <li>ANPDP Notification: Where required by Algerian law</li>
            </ul>

            <h3>12.3 Acceptance and Objection</h3>
            <p>
              Your continued use of the Service after changes are posted constitutes acceptance of the updated Privacy Policy. If you do not agree to changes, you may:
            </p>
            <ul>
              <li>Discontinue use of the Service</li>
              <li>Request account deletion</li>
              <li>Exercise your data subject rights</li>
              <li>Contact us to discuss specific concerns</li>
            </ul>

            <h2>13. Regulatory Compliance</h2>
            
            <h3>13.1 Algerian Law Compliance</h3>
            <p>We comply with all applicable Algerian data protection and e-commerce laws, including:</p>
            <ul>
              <li>Law No. 18-07 of June 10, 2018 on Personal Data Protection</li>
              <li>Law No. 18-05 of May 10, 2018 on Electronic Commerce</li>
              <li>Algerian Commercial Code provisions</li>
              <li>Consumer protection regulations</li>
            </ul>

            <h3>13.2 ANPDP Registration and Compliance</h3>
            <p>We maintain:</p>
            <ul>
              <li>Processing Declarations: Filed with ANPDP for all data processing activities</li>
              <li>Transfer Authorizations: Obtained for international data transfers</li>
              <li>Regular Reporting: Compliance reports as required by law</li>
              <li>Data Protection Officer: Designated representative for ANPDP communications</li>
            </ul>

            <h3>13.3 International Standards</h3>
            <p>Our practices align with international standards including:</p>
            <ul>
              <li>GDPR principles for EU data subjects</li>
              <li>ISO 27001 security standards</li>
              <li>SOC 2 compliance for service providers</li>
            </ul>

            <h2>14. California Privacy Rights (CCPA)</h2>
            <p>
              For users in California, USA, you have additional privacy rights under the California Consumer Privacy Act (CCPA):
            </p>

            <h3>14.1 CCPA Rights</h3>
            <ul>
              <li>Right to Know: Information about personal information collection and use</li>
              <li>Right to Delete: Request deletion of personal information</li>
              <li>Right to Opt-Out: Opt-out of sale of personal information (we do not sell personal information)</li>
              <li>Right to Non-Discrimination: Equal service regardless of privacy choices</li>
            </ul>

            <h3>14.2 Exercising CCPA Rights</h3>
            <p>
              California residents can exercise these rights by contacting hello@zidnadigital.com with "California Privacy Request" in the subject line.
            </p>

            <h2>15. Contact Information and Data Protection Officer</h2>
            <p>For questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>

            <div className="bg-muted p-4 rounded-lg my-4">
              <p className="font-semibold mb-2">Privacy and Data Protection Contact:</p>
              <p><strong>Company:</strong> Zidna Digital</p>
              <p><strong>Privacy Email:</strong> hello@zidnadigital.com</p>
              <p><strong>General Contact:</strong> contact@zidnadigital.com</p>
              <p><strong>Address:</strong> Zidna Digital, Av. du 1er Novembre, Ghardaïa - Algeria</p>
              <p><strong>Phone:</strong> +213 563266253</p>
              <p><strong>ANPDP Registration:</strong> [Registration number to be updated upon ANPDP filing]</p>
            </div>

            <p>We are committed to resolving privacy concerns promptly and transparently, typically within 30 days of receipt.</p>

            <h2>16. Consent and Acknowledgment</h2>
            <p>By using Zidna Social Hub, you acknowledge that:</p>
            <ul>
              <li>You have read and understood this Privacy Policy in its entirety</li>
              <li>You consent to the collection, use, and sharing of your information as described</li>
              <li>You understand your privacy rights and how to exercise them</li>
              <li>You agree to our data practices in accordance with applicable laws including Algerian data protection law</li>
              <li>You understand that you may withdraw consent at any time where consent is the basis for processing</li>
            </ul>

            <p className="mt-6 text-sm text-muted-foreground">
              If you do not agree with this Privacy Policy, you must not use the Service.
            </p>

            <p className="mt-6">
              <strong>Thank you for trusting Zidna Digital with your information. We are committed to protecting your privacy and providing a secure, reliable Service in full compliance with Algerian law and international standards.</strong>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
