import Link from 'next/link';

export const metadata = {
  title: 'Data Processing Agreement | Melaka',
  description: 'Data Processing Agreement for Melaka translation services',
};

export default function DPAPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Data Processing Agreement</h1>
        <p className="text-gray-500 mb-8">Last updated: March 28, 2026</p>

        <div className="bg-white rounded-lg shadow-sm p-8 prose prose-gray max-w-none">
          <p className="text-lg text-gray-600 mb-8">
            This Data Processing Agreement ("DPA") forms part of the Terms of Service between 
            Vehan Apps ("Processor", "we", "us") and the customer ("Controller", "you") for 
            the use of Melaka translation services.
          </p>

          <h2>1. Definitions</h2>
          <ul>
            <li><strong>"Personal Data"</strong> means any information relating to an identified or identifiable natural person.</li>
            <li><strong>"Processing"</strong> means any operation performed on Personal Data, including collection, storage, use, disclosure, or deletion.</li>
            <li><strong>"Data Subject"</strong> means the individual to whom Personal Data relates.</li>
            <li><strong>"Sub-processor"</strong> means any third party engaged by us to process Personal Data on your behalf.</li>
            <li><strong>"GDPR"</strong> means the General Data Protection Regulation (EU) 2016/679.</li>
            <li><strong>"Customer Data"</strong> means the content you submit to Melaka for translation.</li>
          </ul>

          <h2>2. Scope and Roles</h2>
          <h3>2.1 Controller and Processor</h3>
          <p>
            For the purposes of this DPA:
          </p>
          <ul>
            <li>You are the <strong>Data Controller</strong> — you determine the purposes and means of processing Personal Data.</li>
            <li>We are the <strong>Data Processor</strong> — we process Personal Data on your behalf according to your instructions.</li>
          </ul>

          <h3>2.2 Subject Matter</h3>
          <p>
            This DPA applies to all Personal Data that we process on your behalf through the Melaka service, including:
          </p>
          <ul>
            <li>Content submitted for translation that may contain Personal Data</li>
            <li>Metadata associated with translation jobs</li>
            <li>Any Personal Data stored in your Firestore database that we access</li>
          </ul>

          <h2>3. Your Instructions</h2>
          <p>
            We will only process Personal Data:
          </p>
          <ul>
            <li>According to your documented instructions</li>
            <li>As necessary to provide the Melaka service</li>
            <li>As required by applicable law (we will notify you unless prohibited)</li>
          </ul>
          <p>
            Your use of the Melaka service constitutes your instructions to process Personal Data 
            as described in this DPA and our Privacy Policy.
          </p>

          <h2>4. Our Obligations</h2>
          <h3>4.1 Confidentiality</h3>
          <p>
            We ensure that persons authorized to process Personal Data:
          </p>
          <ul>
            <li>Have committed to confidentiality or are under statutory obligation of confidentiality</li>
            <li>Process Personal Data only on your instructions</li>
          </ul>

          <h3>4.2 Security Measures</h3>
          <p>
            We implement appropriate technical and organizational measures to protect Personal Data, including:
          </p>
          <ul>
            <li><strong>Encryption:</strong> All data encrypted at rest (AES-256) and in transit (TLS 1.3)</li>
            <li><strong>Access Control:</strong> Role-based access, multi-factor authentication</li>
            <li><strong>OAuth Tokens:</strong> Encrypted with AES-256-GCM before storage</li>
            <li><strong>Infrastructure:</strong> Google Cloud Platform with SOC 2 Type II certification</li>
            <li><strong>Monitoring:</strong> 24/7 security monitoring and incident detection</li>
            <li><strong>Backups:</strong> Point-in-time recovery enabled</li>
          </ul>

          <h3>4.3 Sub-processors</h3>
          <p>
            You authorize us to engage the following sub-processors:
          </p>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Sub-processor</th>
                <th className="text-left py-2">Purpose</th>
                <th className="text-left py-2">Location</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2">Google Cloud Platform</td>
                <td className="py-2">Infrastructure hosting</td>
                <td className="py-2">United States</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Google (Gemini API)</td>
                <td className="py-2">AI translation processing</td>
                <td className="py-2">United States</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Stripe</td>
                <td className="py-2">Payment processing</td>
                <td className="py-2">United States</td>
              </tr>
              <tr>
                <td className="py-2">Sentry</td>
                <td className="py-2">Error monitoring</td>
                <td className="py-2">United States</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-4">
            We will notify you of any intended changes to sub-processors, giving you the opportunity 
            to object. If you object, we will work with you to find an alternative solution.
          </p>

          <h3>4.4 Data Subject Rights</h3>
          <p>
            We will assist you in responding to Data Subject requests to exercise their rights under GDPR:
          </p>
          <ul>
            <li>Right of access</li>
            <li>Right to rectification</li>
            <li>Right to erasure ("right to be forgotten")</li>
            <li>Right to restriction of processing</li>
            <li>Right to data portability</li>
            <li>Right to object</li>
          </ul>
          <p>
            If we receive a request directly from a Data Subject, we will promptly notify you 
            unless prohibited by law.
          </p>

          <h3>4.5 Data Breach Notification</h3>
          <p>
            We will notify you without undue delay (and in any event within 72 hours) upon 
            becoming aware of a Personal Data breach affecting your data. Notification will include:
          </p>
          <ul>
            <li>Description of the nature of the breach</li>
            <li>Categories and approximate number of Data Subjects affected</li>
            <li>Likely consequences of the breach</li>
            <li>Measures taken or proposed to address the breach</li>
          </ul>

          <h2>5. Your Obligations</h2>
          <p>You warrant that:</p>
          <ul>
            <li>You have the legal authority to submit Personal Data for processing</li>
            <li>You have provided appropriate notices and obtained necessary consents from Data Subjects</li>
            <li>Your instructions comply with applicable data protection laws</li>
            <li>You will not submit special categories of Personal Data (health, biometric, etc.) without explicit agreement</li>
          </ul>

          <h2>6. International Data Transfers</h2>
          <p>
            Personal Data may be transferred to and processed in the United States. We ensure 
            appropriate safeguards through:
          </p>
          <ul>
            <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
            <li>Supplementary measures as required</li>
            <li>Data Processing Agreements with all sub-processors</li>
          </ul>
          <p>
            For transfers from the EEA, UK, or Switzerland, the Standard Contractual Clauses 
            (Module Two: Controller to Processor) are incorporated by reference.
          </p>

          <h2>7. Audits</h2>
          <p>
            Upon reasonable request and subject to confidentiality obligations, we will:
          </p>
          <ul>
            <li>Provide information necessary to demonstrate compliance with this DPA</li>
            <li>Allow for and contribute to audits conducted by you or your auditor</li>
            <li>Provide access to relevant certifications and audit reports</li>
          </ul>
          <p>
            Audits will be conducted with reasonable notice, during normal business hours, 
            and in a manner that minimizes disruption to our operations.
          </p>

          <h2>8. Data Retention and Deletion</h2>
          <h3>8.1 During the Agreement</h3>
          <ul>
            <li>Customer Data is retained only as long as necessary to provide the service</li>
            <li>Translation content is processed transiently and not stored after completion</li>
            <li>Usage logs are retained for 90 days</li>
          </ul>

          <h3>8.2 Upon Termination</h3>
          <p>
            Upon termination of our agreement or upon your request:
          </p>
          <ul>
            <li>We will delete or return all Personal Data within 30 days</li>
            <li>We will provide certification of deletion upon request</li>
            <li>We may retain data as required by law (with notification)</li>
          </ul>

          <h2>9. Liability</h2>
          <p>
            Each party's liability under this DPA is subject to the limitations set forth 
            in the Terms of Service. Nothing in this DPA limits either party's liability for:
          </p>
          <ul>
            <li>Death or personal injury caused by negligence</li>
            <li>Fraud or fraudulent misrepresentation</li>
            <li>Any matter which cannot be limited by law</li>
          </ul>

          <h2>10. Term</h2>
          <p>
            This DPA remains in effect for the duration of our processing of Personal Data 
            on your behalf. The obligations in Sections 4, 6, 7, and 8 survive termination.
          </p>

          <h2>11. Amendments</h2>
          <p>
            We may update this DPA to reflect changes in law or our practices. Material changes 
            will be notified via email. Continued use of the service constitutes acceptance.
          </p>

          <h2>12. Contact</h2>
          <p>For DPA-related inquiries:</p>
          <ul>
            <li>Email: <a href="mailto:dpa@melaka.dev">dpa@melaka.dev</a></li>
            <li>Data Protection Officer: <a href="mailto:privacy@melaka.dev">privacy@melaka.dev</a></li>
          </ul>

          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Request a Signed DPA</h3>
            <p className="text-gray-600 mb-4">
              Enterprise customers can request a countersigned copy of this DPA for their records.
            </p>
            <a 
              href="mailto:dpa@melaka.dev?subject=DPA%20Signature%20Request"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Request Signed DPA
            </a>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-6 text-sm text-gray-500">
          <Link href="/privacy" className="hover:text-gray-700">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-gray-700">Terms of Service</Link>
          <Link href="/gdpr" className="hover:text-gray-700">GDPR Compliance</Link>
        </div>
      </div>
    </div>
  );
}
