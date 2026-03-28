import Link from 'next/link';

export const metadata = {
  title: 'GDPR Compliance | Melaka',
  description: 'How Melaka complies with GDPR and protects your data',
};

export default function GDPRPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">GDPR Compliance</h1>
        <p className="text-gray-500 mb-8">How Melaka protects your data under GDPR</p>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-semibold text-gray-900 mb-2">Data Protection</h3>
            <p className="text-gray-600 text-sm">AES-256 encryption at rest and TLS 1.3 in transit</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="text-3xl mb-3">📋</div>
            <h3 className="font-semibold text-gray-900 mb-2">DPA Available</h3>
            <p className="text-gray-600 text-sm">Standard Data Processing Agreement for all customers</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="text-3xl mb-3">🌍</div>
            <h3 className="font-semibold text-gray-900 mb-2">SCCs Included</h3>
            <p className="text-gray-600 text-sm">Standard Contractual Clauses for international transfers</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 prose prose-gray max-w-none">
          <h2>Our Commitment to GDPR</h2>
          <p>
            Melaka is committed to helping our customers comply with the General Data Protection 
            Regulation (GDPR). We have implemented comprehensive technical and organizational 
            measures to ensure the security and privacy of personal data.
          </p>

          <h2>Roles and Responsibilities</h2>
          <div className="bg-blue-50 p-6 rounded-lg not-prose mb-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">You (Data Controller)</h4>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Determine what data to translate</li>
                  <li>• Ensure legal basis for processing</li>
                  <li>• Respond to data subject requests</li>
                  <li>• Notify your users about data processing</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Melaka (Data Processor)</h4>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Process data per your instructions</li>
                  <li>• Implement security measures</li>
                  <li>• Assist with data subject requests</li>
                  <li>• Notify you of any data breaches</li>
                </ul>
              </div>
            </div>
          </div>

          <h2>Data We Process</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3">Data Type</th>
                <th className="text-left py-3">Purpose</th>
                <th className="text-left py-3">Retention</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3"><strong>Account Info</strong><br/><span className="text-gray-500">Email, name, profile picture</span></td>
                <td className="py-3">Authentication & account management</td>
                <td className="py-3">Until account deletion</td>
              </tr>
              <tr className="border-b">
                <td className="py-3"><strong>Translation Content</strong><br/><span className="text-gray-500">Document fields you submit</span></td>
                <td className="py-3">Translation processing</td>
                <td className="py-3">Transient (not stored after processing)</td>
              </tr>
              <tr className="border-b">
                <td className="py-3"><strong>OAuth Tokens</strong><br/><span className="text-gray-500">Access to your Firestore</span></td>
                <td className="py-3">Firestore read/write access</td>
                <td className="py-3">Until disconnected or expired</td>
              </tr>
              <tr className="border-b">
                <td className="py-3"><strong>Usage Data</strong><br/><span className="text-gray-500">Translation counts, logs</span></td>
                <td className="py-3">Billing & service monitoring</td>
                <td className="py-3">90 days (logs), 7 years (billing)</td>
              </tr>
              <tr>
                <td className="py-3"><strong>Payment Info</strong><br/><span className="text-gray-500">Handled by Stripe</span></td>
                <td className="py-3">Subscription management</td>
                <td className="py-3">Per Stripe's retention policy</td>
              </tr>
            </tbody>
          </table>

          <h2>Your Rights Under GDPR</h2>
          <p>As a data subject, you have the following rights:</p>
          
          <div className="grid md:grid-cols-2 gap-4 not-prose mb-6">
            {[
              { right: 'Right of Access', desc: 'Request a copy of your personal data', action: 'Export Data' },
              { right: 'Right to Rectification', desc: 'Correct inaccurate personal data', action: 'Update Profile' },
              { right: 'Right to Erasure', desc: 'Request deletion of your data', action: 'Delete Account' },
              { right: 'Right to Restrict', desc: 'Limit how we process your data', action: 'Contact Us' },
              { right: 'Right to Portability', desc: 'Receive data in machine-readable format', action: 'Export Data' },
              { right: 'Right to Object', desc: 'Object to certain processing activities', action: 'Contact Us' },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900">{item.right}</h4>
                <p className="text-gray-600 text-sm mb-2">{item.desc}</p>
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">{item.action}</span>
              </div>
            ))}
          </div>

          <p>
            To exercise any of these rights, contact us at{' '}
            <a href="mailto:privacy@melaka.dev">privacy@melaka.dev</a>. We will respond within 
            30 days as required by GDPR.
          </p>

          <h2>International Data Transfers</h2>
          <p>
            Melaka processes data in the United States. For transfers from the European Economic 
            Area (EEA), UK, or Switzerland, we rely on:
          </p>
          <ul>
            <li><strong>Standard Contractual Clauses (SCCs)</strong> — EU Commission-approved contractual terms</li>
            <li><strong>Supplementary Measures</strong> — Additional technical safeguards including encryption</li>
            <li><strong>Sub-processor Agreements</strong> — All sub-processors bound by equivalent obligations</li>
          </ul>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg not-prose my-6">
            <h4 className="font-semibold text-yellow-900 mb-2">📍 Data Residency</h4>
            <p className="text-yellow-800 text-sm">
              Currently, all data is processed in US regions. Enterprise customers requiring 
              EU-only processing can contact us at <a href="mailto:enterprise@melaka.dev" className="underline">enterprise@melaka.dev</a>.
            </p>
          </div>

          <h2>Security Measures</h2>
          <p>
            We implement appropriate technical and organizational measures as required by 
            Article 32 of GDPR:
          </p>

          <div className="grid md:grid-cols-2 gap-4 not-prose mb-6">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Technical Measures</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ AES-256 encryption at rest</li>
                <li>✓ TLS 1.3 encryption in transit</li>
                <li>✓ OAuth tokens encrypted with AES-256-GCM</li>
                <li>✓ Point-in-time recovery backups</li>
                <li>✓ Firewall and DDoS protection</li>
                <li>✓ Automated vulnerability scanning</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Organizational Measures</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Role-based access control</li>
                <li>✓ Employee confidentiality agreements</li>
                <li>✓ Security awareness training</li>
                <li>✓ Incident response procedures</li>
                <li>✓ Regular security audits</li>
                <li>✓ Vendor security assessments</li>
              </ul>
            </div>
          </div>

          <h2>Sub-processors</h2>
          <p>
            We use the following sub-processors to deliver our service. All sub-processors are 
            bound by data processing agreements with equivalent protections:
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3">Sub-processor</th>
                <th className="text-left py-3">Purpose</th>
                <th className="text-left py-3">Location</th>
                <th className="text-left py-3">Transfer Mechanism</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3">Google Cloud Platform</td>
                <td className="py-3">Infrastructure</td>
                <td className="py-3">🇺🇸 United States</td>
                <td className="py-3">SCCs</td>
              </tr>
              <tr className="border-b">
                <td className="py-3">Google (Gemini API)</td>
                <td className="py-3">AI Translation</td>
                <td className="py-3">🇺🇸 United States</td>
                <td className="py-3">SCCs</td>
              </tr>
              <tr className="border-b">
                <td className="py-3">Stripe</td>
                <td className="py-3">Payments</td>
                <td className="py-3">🇺🇸 United States</td>
                <td className="py-3">SCCs</td>
              </tr>
              <tr className="border-b">
                <td className="py-3">Sentry</td>
                <td className="py-3">Error Monitoring</td>
                <td className="py-3">🇺🇸 United States</td>
                <td className="py-3">SCCs</td>
              </tr>
              <tr>
                <td className="py-3">Firebase</td>
                <td className="py-3">Authentication</td>
                <td className="py-3">🇺🇸 United States</td>
                <td className="py-3">SCCs</td>
              </tr>
            </tbody>
          </table>

          <h2>Data Breach Notification</h2>
          <p>
            In the event of a personal data breach, we will:
          </p>
          <ul>
            <li>Notify you within <strong>72 hours</strong> of becoming aware</li>
            <li>Provide details of the breach, affected data, and remediation steps</li>
            <li>Cooperate with your notification obligations to supervisory authorities</li>
            <li>Document the breach and our response for audit purposes</li>
          </ul>

          <h2>Data Protection Impact Assessments</h2>
          <p>
            We conduct Data Protection Impact Assessments (DPIAs) when:
          </p>
          <ul>
            <li>Introducing new features that process personal data</li>
            <li>Changing how we process personal data significantly</li>
            <li>Engaging new sub-processors</li>
          </ul>
          <p>
            Enterprise customers may request DPIA documentation for their records.
          </p>

          <h2>AI Processing Considerations</h2>
          <p>
            Melaka uses AI (Google Gemini) for translations. Important considerations:
          </p>
          <ul>
            <li><strong>No Training:</strong> Your data is NOT used to train AI models (Gemini API terms)</li>
            <li><strong>Transient Processing:</strong> Content is processed and immediately discarded</li>
            <li><strong>No Profiling:</strong> We do not use AI to make automated decisions about individuals</li>
            <li><strong>Human Override:</strong> All translations can be manually edited</li>
          </ul>

          <h2>Contact & Complaints</h2>
          <div className="grid md:grid-cols-2 gap-4 not-prose mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Data Protection Contact</h4>
              <p className="text-sm text-gray-600 mb-2">For privacy inquiries and data requests:</p>
              <a href="mailto:privacy@melaka.dev" className="text-blue-600">privacy@melaka.dev</a>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Supervisory Authority</h4>
              <p className="text-sm text-gray-600 mb-2">You have the right to lodge a complaint with your local data protection authority.</p>
              <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" target="_blank" rel="noopener" className="text-blue-600 text-sm">Find your DPA →</a>
            </div>
          </div>

          <h2>Documentation</h2>
          <p>The following documents support our GDPR compliance:</p>
          <ul>
            <li><Link href="/privacy">Privacy Policy</Link> — How we collect and use data</li>
            <li><Link href="/dpa">Data Processing Agreement</Link> — Controller-Processor terms</li>
            <li><Link href="/terms">Terms of Service</Link> — Service usage terms</li>
          </ul>
        </div>

        <div className="mt-8 bg-blue-600 text-white rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Need a Data Processing Agreement?</h3>
          <p className="mb-6 text-blue-100">
            Download our standard DPA or request a countersigned copy for your records.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/dpa"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50"
            >
              View DPA
            </Link>
            <a 
              href="mailto:dpa@melaka.dev?subject=Signed%20DPA%20Request"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-400"
            >
              Request Signed Copy
            </a>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-6 text-sm text-gray-500">
          <Link href="/privacy" className="hover:text-gray-700">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-gray-700">Terms of Service</Link>
          <Link href="/dpa" className="hover:text-gray-700">Data Processing Agreement</Link>
        </div>
      </div>
    </div>
  );
}
