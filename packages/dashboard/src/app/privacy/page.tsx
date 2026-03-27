import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Melaka',
  description: 'Privacy Policy for Melaka translation services',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: March 27, 2026</p>

        <div className="bg-white rounded-lg shadow-sm p-8 prose prose-gray max-w-none">
          <h2>1. Introduction</h2>
          <p>
            Melaka ("we", "our", or "us") is operated by Vehan Apps. This Privacy Policy explains 
            how we collect, use, disclose, and safeguard your information when you use our 
            translation service at melaka.dev (the "Service").
          </p>
          <p>
            By using the Service, you agree to the collection and use of information in accordance 
            with this policy.
          </p>

          <h2>2. Information We Collect</h2>
          
          <h3>2.1 Account Information</h3>
          <p>When you create an account, we collect:</p>
          <ul>
            <li>Email address</li>
            <li>Name (from Google OAuth)</li>
            <li>Profile picture (from Google OAuth)</li>
          </ul>

          <h3>2.2 Firebase Project Data</h3>
          <p>
            When you connect your Firebase project, we access your Firestore database using OAuth. 
            We collect:
          </p>
          <ul>
            <li>Firebase project ID</li>
            <li>Document content from collections you configure for translation</li>
            <li>OAuth tokens (encrypted at rest)</li>
          </ul>
          <p>
            <strong>We do not store your Firebase credentials.</strong> We use Google OAuth to 
            obtain temporary access tokens that you can revoke at any time.
          </p>

          <h3>2.3 Usage Data</h3>
          <p>We automatically collect:</p>
          <ul>
            <li>Translation counts and character counts</li>
            <li>API request logs</li>
            <li>Error logs for debugging</li>
            <li>IP addresses (for rate limiting and security)</li>
          </ul>

          <h3>2.4 Payment Information</h3>
          <p>
            Payment processing is handled by Stripe. We do not store your credit card details. 
            We receive from Stripe:
          </p>
          <ul>
            <li>Stripe customer ID</li>
            <li>Subscription status</li>
            <li>Payment history (amounts and dates)</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use the collected information to:</p>
          <ul>
            <li>Provide and maintain the Service</li>
            <li>Process translations for your Firestore documents</li>
            <li>Process payments and manage subscriptions</li>
            <li>Send service-related communications</li>
            <li>Monitor and analyze usage patterns</li>
            <li>Detect and prevent fraud or abuse</li>
            <li>Improve the Service</li>
          </ul>

          <h2>4. Data Processing and AI</h2>
          <p>
            To translate your content, we send document text to AI providers (currently Google Gemini). 
            These providers:
          </p>
          <ul>
            <li>Process data according to their own privacy policies</li>
            <li>Do not use your data to train their models (for API customers)</li>
            <li>Process data transiently and do not retain it</li>
          </ul>
          <p>
            We do not send any personally identifiable information to AI providers — only the 
            text content you've configured for translation.
          </p>

          <h2>5. Data Storage and Security</h2>
          <p>Your data is stored securely:</p>
          <ul>
            <li><strong>Location:</strong> Google Cloud Platform (US regions)</li>
            <li><strong>Encryption:</strong> All data encrypted at rest (AES-256) and in transit (TLS 1.3)</li>
            <li><strong>OAuth tokens:</strong> Encrypted with AES-256-GCM before storage</li>
            <li><strong>Backups:</strong> Point-in-time recovery enabled</li>
            <li><strong>Access:</strong> Restricted to authorized personnel only</li>
          </ul>

          <h2>6. Data Sharing</h2>
          <p>We do not sell your personal information. We may share data with:</p>
          <ul>
            <li><strong>AI Providers:</strong> Document text for translation (Google Gemini)</li>
            <li><strong>Payment Processor:</strong> Stripe for payment processing</li>
            <li><strong>Analytics:</strong> Aggregated, anonymized usage statistics</li>
            <li><strong>Legal Requirements:</strong> If required by law or legal process</li>
          </ul>

          <h2>7. Data Retention</h2>
          <ul>
            <li><strong>Account data:</strong> Retained until you delete your account</li>
            <li><strong>Usage logs:</strong> Retained for 90 days</li>
            <li><strong>OAuth tokens:</strong> Retained until disconnected or expired</li>
            <li><strong>Payment records:</strong> Retained for 7 years (tax compliance)</li>
          </ul>

          <h2>8. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of your data</li>
            <li><strong>Correction:</strong> Update inaccurate information</li>
            <li><strong>Deletion:</strong> Delete your account and associated data</li>
            <li><strong>Portability:</strong> Export your data in a standard format</li>
            <li><strong>Revoke Access:</strong> Disconnect your Firebase project at any time</li>
            <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
          </ul>
          <p>
            To exercise these rights, contact us at{' '}
            <a href="mailto:privacy@melaka.dev">privacy@melaka.dev</a>.
          </p>

          <h2>9. GDPR Compliance (EEA Users)</h2>
          <p>If you are in the European Economic Area:</p>
          <ul>
            <li>We process data under legitimate interests (service provision) and consent</li>
            <li>You may request data deletion under the "right to be forgotten"</li>
            <li>Data transfers outside the EEA use standard contractual clauses</li>
            <li>You may lodge a complaint with your local supervisory authority</li>
          </ul>

          <h2>10. Children's Privacy</h2>
          <p>
            The Service is not intended for users under 18 years of age. We do not knowingly 
            collect information from children. If you believe we have collected data from a 
            child, please contact us immediately.
          </p>

          <h2>11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any 
            changes by posting the new policy on this page and updating the "Last updated" date.
          </p>
          <p>
            Continued use of the Service after changes constitutes acceptance of the new policy.
          </p>

          <h2>12. Contact Us</h2>
          <p>For privacy-related inquiries:</p>
          <ul>
            <li>Email: <a href="mailto:privacy@melaka.dev">privacy@melaka.dev</a></li>
            <li>Company: Vehan Apps</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <Link href="/terms" className="text-blue-600 hover:underline">
            View Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  );
}
