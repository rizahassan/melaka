import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | Melaka',
  description: 'Terms of Service for Melaka translation services',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: March 27, 2026</p>

        <div className="bg-white rounded-lg shadow-sm p-8 prose prose-gray max-w-none">
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using Melaka ("Service"), operated by Vehan Apps ("we", "us", or "our"), 
            you agree to be bound by these Terms of Service ("Terms"). If you disagree with any 
            part of the terms, you may not access the Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            Melaka provides AI-powered translation services for Firebase Firestore databases. 
            The Service includes:
          </p>
          <ul>
            <li>Automated translation of Firestore document fields</li>
            <li>A web dashboard for managing translations</li>
            <li>APIs and SDKs for programmatic access</li>
            <li>Usage analytics and monitoring</li>
          </ul>

          <h2>3. Account Registration</h2>
          <p>To use the Service, you must:</p>
          <ul>
            <li>Create an account using Google OAuth</li>
            <li>Provide accurate and complete information</li>
            <li>Be at least 18 years old</li>
            <li>Maintain the security of your account credentials</li>
          </ul>
          <p>
            You are responsible for all activities that occur under your account.
          </p>

          <h2>4. Free Trial</h2>
          <p>
            New users receive a free trial that includes:
          </p>
          <ul>
            <li>14 days of access OR 500 translations, whichever comes first</li>
            <li>Full access to all features during the trial period</li>
            <li>No credit card required to start</li>
          </ul>
          <p>
            After the trial, you must subscribe to a paid plan to continue using the Service.
          </p>

          <h2>5. Subscription and Payment</h2>
          
          <h3>5.1 Pricing</h3>
          <p>
            Current pricing is available at{' '}
            <Link href="/pricing">melaka.dev/pricing</Link>. Prices are subject to change 
            with 30 days notice.
          </p>

          <h3>5.2 Billing</h3>
          <ul>
            <li>Subscriptions are billed monthly in advance</li>
            <li>Payment is processed through Stripe</li>
            <li>Failed payments may result in service suspension</li>
            <li>You may cancel at any time; service continues until the end of the billing period</li>
          </ul>

          <h3>5.3 Refunds</h3>
          <p>
            We offer refunds at our discretion. Generally:
          </p>
          <ul>
            <li>Refunds are available within 7 days of initial subscription</li>
            <li>No refunds for partial months or unused translations</li>
            <li>Contact support@melaka.dev for refund requests</li>
          </ul>

          <h2>6. Acceptable Use</h2>
          <p>You agree NOT to:</p>
          <ul>
            <li>Use the Service for any illegal purpose</li>
            <li>Translate content that violates intellectual property rights</li>
            <li>Attempt to bypass usage limits or security measures</li>
            <li>Share your account with others or resell access</li>
            <li>Reverse engineer or attempt to extract source code</li>
            <li>Use the Service to harm, harass, or defraud others</li>
            <li>Submit malicious content or attempt to compromise the Service</li>
            <li>Translate content that is illegal, harmful, or violates third-party rights</li>
          </ul>
          <p>
            We reserve the right to suspend or terminate accounts that violate these terms.
          </p>

          <h2>7. Your Content</h2>
          <p>
            You retain all rights to the content you submit for translation ("Your Content"). 
            By using the Service, you grant us a limited license to:
          </p>
          <ul>
            <li>Access Your Content to provide translation services</li>
            <li>Store Your Content temporarily during processing</li>
            <li>Send Your Content to AI providers for translation</li>
          </ul>
          <p>
            We do not claim ownership of Your Content and will not use it for purposes other 
            than providing the Service.
          </p>

          <h2>8. Translation Quality</h2>
          <p>
            <strong>Translations are provided "as is" using AI technology.</strong> While we 
            strive for accuracy:
          </p>
          <ul>
            <li>We do not guarantee translations are error-free</li>
            <li>AI translations may not capture nuance or context perfectly</li>
            <li>For critical or legal content, human review is recommended</li>
            <li>You are responsible for reviewing and validating translations</li>
          </ul>

          <h2>9. Service Availability</h2>
          <p>
            We aim for 99.9% uptime but do not guarantee uninterrupted service. We may:
          </p>
          <ul>
            <li>Perform scheduled maintenance with reasonable notice</li>
            <li>Experience outages due to third-party providers</li>
            <li>Modify or discontinue features with notice</li>
          </ul>
          <p>
            We will provide reasonable notice of significant changes to the Service.
          </p>

          <h2>10. Data and Privacy</h2>
          <p>
            Your use of the Service is also governed by our{' '}
            <Link href="/privacy">Privacy Policy</Link>, which describes how we collect, 
            use, and protect your data.
          </p>

          <h2>11. Intellectual Property</h2>
          <p>
            The Service, including its code, design, and documentation, is owned by Vehan Apps 
            and protected by intellectual property laws. The Melaka SDK is open source under 
            the MIT License.
          </p>
          <p>
            "Melaka" and the Melaka logo are trademarks of Vehan Apps.
          </p>

          <h2>12. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW:
          </p>
          <ul>
            <li>
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED
            </li>
            <li>
              WE ARE NOT LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR 
              PUNITIVE DAMAGES
            </li>
            <li>
              OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE PAST 12 MONTHS
            </li>
            <li>
              WE ARE NOT RESPONSIBLE FOR ERRORS IN TRANSLATIONS OR THEIR CONSEQUENCES
            </li>
          </ul>

          <h2>13. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Vehan Apps from any claims, damages, 
            losses, or expenses arising from:
          </p>
          <ul>
            <li>Your use of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your Content or its translation</li>
            <li>Your violation of any third-party rights</li>
          </ul>

          <h2>14. Termination</h2>
          <p>
            We may suspend or terminate your account if you violate these Terms. Upon termination:
          </p>
          <ul>
            <li>Your access to the Service will be revoked</li>
            <li>You may request export of your data within 30 days</li>
            <li>We may delete your data after 30 days</li>
            <li>No refunds for remaining subscription time</li>
          </ul>
          <p>
            You may terminate your account at any time through the dashboard settings.
          </p>

          <h2>15. Dispute Resolution</h2>
          <p>
            Any disputes arising from these Terms shall be:
          </p>
          <ul>
            <li>First addressed through informal negotiation</li>
            <li>Governed by the laws of Washington State, USA</li>
            <li>Subject to the exclusive jurisdiction of courts in Washington State</li>
          </ul>
          <p>
            You waive any right to participate in class action lawsuits against us.
          </p>

          <h2>16. Changes to Terms</h2>
          <p>
            We may modify these Terms at any time. We will notify you of material changes via 
            email or through the Service. Continued use after changes constitutes acceptance.
          </p>

          <h2>17. General Provisions</h2>
          <ul>
            <li>
              <strong>Severability:</strong> If any provision is found invalid, the remaining 
              provisions remain in effect
            </li>
            <li>
              <strong>Waiver:</strong> Failure to enforce a provision does not waive our right 
              to enforce it later
            </li>
            <li>
              <strong>Assignment:</strong> You may not assign your rights under these Terms; 
              we may assign ours
            </li>
            <li>
              <strong>Entire Agreement:</strong> These Terms constitute the entire agreement 
              between you and us
            </li>
          </ul>

          <h2>18. Contact Us</h2>
          <p>For questions about these Terms:</p>
          <ul>
            <li>Email: <a href="mailto:legal@melaka.dev">legal@melaka.dev</a></li>
            <li>Company: Vehan Apps</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <Link href="/privacy" className="text-blue-600 hover:underline">
            View Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  );
}
