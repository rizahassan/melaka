import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Data Processing Agreement | Melaka',
  description: 'Data Processing Agreement for Melaka translation services',
};

export default function DPAPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/icons/melaka.png" alt="Melaka" width={32} height={32} />
            <span className="text-2xl font-bold text-white">Melaka</span>
          </Link>
          <span className="text-slate-400 ml-4">Legal</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-2">Data Processing Agreement</h1>
        <p className="text-slate-400 mb-8">Last updated: March 28, 2026</p>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
          <p className="text-lg text-slate-300 mb-8">
            This Data Processing Agreement ("DPA") forms part of the Terms of Service between 
            Vehan Apps ("Processor", "we", "us") and the customer ("Controller", "you") for 
            the use of Melaka translation services.
          </p>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">1. Definitions</h2>
            <ul className="text-slate-300 space-y-2 list-disc list-inside">
              <li><strong className="text-white">Personal Data</strong> — any information relating to an identified or identifiable natural person.</li>
              <li><strong className="text-white">Processing</strong> — any operation performed on Personal Data, including collection, storage, use, disclosure, or deletion.</li>
              <li><strong className="text-white">Data Subject</strong> — the individual to whom Personal Data relates.</li>
              <li><strong className="text-white">Sub-processor</strong> — any third party engaged by us to process Personal Data on your behalf.</li>
              <li><strong className="text-white">GDPR</strong> — the General Data Protection Regulation (EU) 2016/679.</li>
              <li><strong className="text-white">Customer Data</strong> — the content you submit to Melaka for translation.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">2. Scope and Roles</h2>
            <h3 className="text-lg font-medium text-white mb-2">2.1 Controller and Processor</h3>
            <p className="text-slate-300 mb-4">For the purposes of this DPA:</p>
            <ul className="text-slate-300 space-y-2 list-disc list-inside mb-6">
              <li>You are the <strong className="text-white">Data Controller</strong> — you determine the purposes and means of processing Personal Data.</li>
              <li>We are the <strong className="text-white">Data Processor</strong> — we process Personal Data on your behalf according to your instructions.</li>
            </ul>

            <h3 className="text-lg font-medium text-white mb-2">2.2 Subject Matter</h3>
            <p className="text-slate-300 mb-2">This DPA applies to all Personal Data that we process on your behalf through the Melaka service, including:</p>
            <ul className="text-slate-300 space-y-2 list-disc list-inside">
              <li>Content submitted for translation that may contain Personal Data</li>
              <li>Metadata associated with translation jobs</li>
              <li>Any Personal Data stored in your Firestore database that we access</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">3. Your Instructions</h2>
            <p className="text-slate-300 mb-4">We will only process Personal Data:</p>
            <ul className="text-slate-300 space-y-2 list-disc list-inside mb-4">
              <li>According to your documented instructions</li>
              <li>As necessary to provide the Melaka service</li>
              <li>As required by applicable law (we will notify you unless prohibited)</li>
            </ul>
            <p className="text-slate-300">
              Your use of the Melaka service constitutes your instructions to process Personal Data 
              as described in this DPA and our Privacy Policy.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">4. Our Obligations</h2>
            
            <h3 className="text-lg font-medium text-white mb-2">4.1 Confidentiality</h3>
            <p className="text-slate-300 mb-4">We ensure that persons authorized to process Personal Data:</p>
            <ul className="text-slate-300 space-y-2 list-disc list-inside mb-6">
              <li>Have committed to confidentiality or are under statutory obligation of confidentiality</li>
              <li>Process Personal Data only on your instructions</li>
            </ul>

            <h3 className="text-lg font-medium text-white mb-2">4.2 Security Measures</h3>
            <p className="text-slate-300 mb-4">We implement appropriate technical and organizational measures to protect Personal Data:</p>
            <div className="grid md:grid-cols-2 gap-3 mb-6">
              {[
                { label: 'Encryption', value: 'AES-256 at rest, TLS 1.3 in transit' },
                { label: 'Access Control', value: 'Role-based, MFA required' },
                { label: 'OAuth Tokens', value: 'Encrypted with AES-256-GCM' },
                { label: 'Infrastructure', value: 'GCP with SOC 2 Type II' },
                { label: 'Monitoring', value: '24/7 security monitoring' },
                { label: 'Backups', value: 'Point-in-time recovery enabled' },
              ].map((item, i) => (
                <div key={i} className="bg-slate-700 rounded-lg p-3">
                  <div className="text-sm text-slate-400">{item.label}</div>
                  <div className="text-white">{item.value}</div>
                </div>
              ))}
            </div>

            <h3 className="text-lg font-medium text-white mb-2">4.3 Sub-processors</h3>
            <p className="text-slate-300 mb-4">You authorize us to engage the following sub-processors:</p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-3 px-4 text-slate-400">Sub-processor</th>
                    <th className="text-left py-3 px-4 text-slate-400">Purpose</th>
                    <th className="text-left py-3 px-4 text-slate-400">Location</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-slate-700">
                    <td className="py-3 px-4">Google Cloud Platform</td>
                    <td className="py-3 px-4">Infrastructure hosting</td>
                    <td className="py-3 px-4">🇺🇸 United States</td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-3 px-4">Google (Gemini API)</td>
                    <td className="py-3 px-4">AI translation processing</td>
                    <td className="py-3 px-4">🇺🇸 United States</td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-3 px-4">Stripe</td>
                    <td className="py-3 px-4">Payment processing</td>
                    <td className="py-3 px-4">🇺🇸 United States</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Sentry</td>
                    <td className="py-3 px-4">Error monitoring</td>
                    <td className="py-3 px-4">🇺🇸 United States</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-slate-300">
              We will notify you of any intended changes to sub-processors, giving you the opportunity to object.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-lg font-medium text-white mb-2">4.4 Data Subject Rights</h3>
            <p className="text-slate-300 mb-4">We will assist you in responding to Data Subject requests to exercise their rights under GDPR:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              {['Access', 'Rectification', 'Erasure', 'Restriction', 'Portability', 'Object'].map((right) => (
                <div key={right} className="bg-slate-700 rounded px-3 py-2 text-slate-300 text-sm text-center">
                  Right to {right}
                </div>
              ))}
            </div>
            <p className="text-slate-300">
              If we receive a request directly from a Data Subject, we will promptly notify you unless prohibited by law.
            </p>
          </section>

          <section className="mb-10">
            <h3 className="text-lg font-medium text-white mb-2">4.5 Data Breach Notification</h3>
            <p className="text-slate-300 mb-4">
              We will notify you without undue delay (and in any event within <strong className="text-white">72 hours</strong>) upon 
              becoming aware of a Personal Data breach affecting your data. Notification will include:
            </p>
            <ul className="text-slate-300 space-y-2 list-disc list-inside">
              <li>Description of the nature of the breach</li>
              <li>Categories and approximate number of Data Subjects affected</li>
              <li>Likely consequences of the breach</li>
              <li>Measures taken or proposed to address the breach</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">5. Your Obligations</h2>
            <p className="text-slate-300 mb-4">You warrant that:</p>
            <ul className="text-slate-300 space-y-2 list-disc list-inside">
              <li>You have the legal authority to submit Personal Data for processing</li>
              <li>You have provided appropriate notices and obtained necessary consents from Data Subjects</li>
              <li>Your instructions comply with applicable data protection laws</li>
              <li>You will not submit special categories of Personal Data without explicit agreement</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">6. International Data Transfers</h2>
            <p className="text-slate-300 mb-4">
              Personal Data may be transferred to and processed in the United States. We ensure appropriate safeguards through:
            </p>
            <ul className="text-slate-300 space-y-2 list-disc list-inside mb-4">
              <li><strong className="text-white">Standard Contractual Clauses (SCCs)</strong> approved by the European Commission</li>
              <li>Supplementary measures as required</li>
              <li>Data Processing Agreements with all sub-processors</li>
            </ul>
            <p className="text-slate-300">
              For transfers from the EEA, UK, or Switzerland, the Standard Contractual Clauses 
              (Module Two: Controller to Processor) are incorporated by reference.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">7. Audits</h2>
            <p className="text-slate-300 mb-4">Upon reasonable request and subject to confidentiality obligations, we will:</p>
            <ul className="text-slate-300 space-y-2 list-disc list-inside">
              <li>Provide information necessary to demonstrate compliance with this DPA</li>
              <li>Allow for and contribute to audits conducted by you or your auditor</li>
              <li>Provide access to relevant certifications and audit reports</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">8. Data Retention and Deletion</h2>
            <h3 className="text-lg font-medium text-white mb-2">8.1 During the Agreement</h3>
            <ul className="text-slate-300 space-y-2 list-disc list-inside mb-4">
              <li>Customer Data is retained only as long as necessary to provide the service</li>
              <li>Translation content is processed transiently and not stored after completion</li>
              <li>Usage logs are retained for 90 days</li>
            </ul>

            <h3 className="text-lg font-medium text-white mb-2">8.2 Upon Termination</h3>
            <p className="text-slate-300 mb-4">Upon termination of our agreement or upon your request:</p>
            <ul className="text-slate-300 space-y-2 list-disc list-inside">
              <li>We will delete or return all Personal Data within 30 days</li>
              <li>We will provide certification of deletion upon request</li>
              <li>We may retain data as required by law (with notification)</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">9. Liability</h2>
            <p className="text-slate-300">
              Each party's liability under this DPA is subject to the limitations set forth in the Terms of Service. 
              Nothing in this DPA limits either party's liability for death, personal injury, fraud, or matters which cannot be limited by law.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">10. Term</h2>
            <p className="text-slate-300">
              This DPA remains in effect for the duration of our processing of Personal Data on your behalf. 
              The obligations in Sections 4, 6, 7, and 8 survive termination.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">11. Contact</h2>
            <p className="text-slate-300 mb-4">For DPA-related inquiries:</p>
            <ul className="text-slate-300 space-y-2">
              <li>📧 Email: <a href="mailto:dpa@melaka.dev" className="text-blue-400 hover:underline">dpa@melaka.dev</a></li>
              <li>🔒 Data Protection: <a href="mailto:privacy@melaka.dev" className="text-blue-400 hover:underline">privacy@melaka.dev</a></li>
            </ul>
          </section>

          {/* Request Signed DPA */}
          <div className="bg-slate-700 rounded-xl p-6 text-center">
            <h3 className="text-xl font-semibold text-white mb-3">Request a Signed DPA</h3>
            <p className="text-slate-300 mb-4">
              Enterprise customers can request a countersigned copy of this DPA for their records.
            </p>
            <a 
              href="mailto:dpa@melaka.dev?subject=DPA%20Signature%20Request"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-500 transition-colors"
            >
              Request Signed DPA
            </a>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-6 text-sm text-slate-400">
          <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white">Terms of Service</Link>
          <Link href="/gdpr" className="hover:text-white">GDPR Compliance</Link>
        </div>
      </div>
    </div>
  );
}
