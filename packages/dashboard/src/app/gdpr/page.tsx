import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'GDPR Compliance | Melaka',
  description: 'How Melaka complies with GDPR and protects your data',
};

export default function GDPRPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-700">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/icons/melaka.png" alt="Melaka" width={32} height={32} />
            <span className="text-2xl font-bold text-white">Melaka</span>
          </Link>
          <span className="text-slate-400 ml-4">Legal</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-2">GDPR Compliance</h1>
        <p className="text-slate-400 mb-8">How Melaka protects your data under GDPR</p>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 border-l-4 border-l-blue-500">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-semibold text-white mb-2">Data Protection</h3>
            <p className="text-slate-400 text-sm">AES-256 encryption at rest and TLS 1.3 in transit</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 border-l-4 border-l-green-500">
            <div className="text-3xl mb-3">📋</div>
            <h3 className="font-semibold text-white mb-2">DPA Available</h3>
            <p className="text-slate-400 text-sm">Standard Data Processing Agreement for all customers</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 border-l-4 border-l-purple-500">
            <div className="text-3xl mb-3">🌍</div>
            <h3 className="font-semibold text-white mb-2">SCCs Included</h3>
            <p className="text-slate-400 text-sm">Standard Contractual Clauses for international transfers</p>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">Our Commitment to GDPR</h2>
            <p className="text-slate-300">
              Melaka is committed to helping our customers comply with the General Data Protection 
              Regulation (GDPR). We have implemented comprehensive technical and organizational 
              measures to ensure the security and privacy of personal data.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">Roles and Responsibilities</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-700 rounded-lg p-5">
                <h4 className="font-semibold text-blue-400 mb-3">You (Data Controller)</h4>
                <ul className="text-slate-300 text-sm space-y-2">
                  <li>• Determine what data to translate</li>
                  <li>• Ensure legal basis for processing</li>
                  <li>• Respond to data subject requests</li>
                  <li>• Notify your users about data processing</li>
                </ul>
              </div>
              <div className="bg-slate-700 rounded-lg p-5">
                <h4 className="font-semibold text-green-400 mb-3">Melaka (Data Processor)</h4>
                <ul className="text-slate-300 text-sm space-y-2">
                  <li>• Process data per your instructions</li>
                  <li>• Implement security measures</li>
                  <li>• Assist with data subject requests</li>
                  <li>• Notify you of any data breaches</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">Data We Process</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-3 px-4 text-slate-400">Data Type</th>
                    <th className="text-left py-3 px-4 text-slate-400">Purpose</th>
                    <th className="text-left py-3 px-4 text-slate-400">Retention</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-slate-700">
                    <td className="py-3 px-4">
                      <strong className="text-white">Account Info</strong>
                      <div className="text-xs text-slate-500">Email, name, profile picture</div>
                    </td>
                    <td className="py-3 px-4">Authentication & account management</td>
                    <td className="py-3 px-4">Until account deletion</td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-3 px-4">
                      <strong className="text-white">Translation Content</strong>
                      <div className="text-xs text-slate-500">Document fields you submit</div>
                    </td>
                    <td className="py-3 px-4">Translation processing</td>
                    <td className="py-3 px-4">Transient (not stored)</td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-3 px-4">
                      <strong className="text-white">OAuth Tokens</strong>
                      <div className="text-xs text-slate-500">Access to your Firestore</div>
                    </td>
                    <td className="py-3 px-4">Firestore read/write access</td>
                    <td className="py-3 px-4">Until disconnected</td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-3 px-4">
                      <strong className="text-white">Usage Data</strong>
                      <div className="text-xs text-slate-500">Translation counts, logs</div>
                    </td>
                    <td className="py-3 px-4">Billing & service monitoring</td>
                    <td className="py-3 px-4">90 days (logs), 7 years (billing)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">
                      <strong className="text-white">Payment Info</strong>
                      <div className="text-xs text-slate-500">Handled by Stripe</div>
                    </td>
                    <td className="py-3 px-4">Subscription management</td>
                    <td className="py-3 px-4">Per Stripe's policy</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">Your Rights Under GDPR</h2>
            <p className="text-slate-300 mb-4">As a data subject, you have the following rights:</p>
            
            <div className="grid md:grid-cols-2 gap-3 mb-6">
              {[
                { right: 'Right of Access', desc: 'Request a copy of your personal data', icon: '👁️' },
                { right: 'Right to Rectification', desc: 'Correct inaccurate personal data', icon: '✏️' },
                { right: 'Right to Erasure', desc: 'Request deletion of your data', icon: '🗑️' },
                { right: 'Right to Restrict', desc: 'Limit how we process your data', icon: '⏸️' },
                { right: 'Right to Portability', desc: 'Receive data in machine-readable format', icon: '📦' },
                { right: 'Right to Object', desc: 'Object to certain processing activities', icon: '✋' },
              ].map((item, i) => (
                <div key={i} className="bg-slate-700 rounded-lg p-4 flex gap-3">
                  <div className="text-2xl">{item.icon}</div>
                  <div>
                    <h4 className="font-semibold text-white">{item.right}</h4>
                    <p className="text-slate-400 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-slate-300">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:privacy@melaka.dev" className="text-blue-400 hover:underline">privacy@melaka.dev</a>. 
              We will respond within 30 days as required by GDPR.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">International Data Transfers</h2>
            <p className="text-slate-300 mb-4">
              Melaka processes data in the United States. For transfers from the European Economic 
              Area (EEA), UK, or Switzerland, we rely on:
            </p>
            <ul className="text-slate-300 space-y-2 list-disc list-inside mb-6">
              <li><strong className="text-white">Standard Contractual Clauses (SCCs)</strong> — EU Commission-approved contractual terms</li>
              <li><strong className="text-white">Supplementary Measures</strong> — Additional technical safeguards including encryption</li>
              <li><strong className="text-white">Sub-processor Agreements</strong> — All sub-processors bound by equivalent obligations</li>
            </ul>

            <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-400 mb-2">📍 Data Residency</h4>
              <p className="text-yellow-200/80 text-sm">
                Currently, all data is processed in US regions. Enterprise customers requiring 
                EU-only processing can contact us at{' '}
                <a href="mailto:enterprise@melaka.dev" className="underline">enterprise@melaka.dev</a>.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">Security Measures</h2>
            <p className="text-slate-300 mb-4">
              We implement appropriate technical and organizational measures as required by Article 32 of GDPR:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-700 rounded-lg p-5">
                <h4 className="font-semibold text-white mb-3">Technical Measures</h4>
                <ul className="text-slate-300 text-sm space-y-2">
                  <li className="flex items-center gap-2"><span className="text-green-400">✓</span> AES-256 encryption at rest</li>
                  <li className="flex items-center gap-2"><span className="text-green-400">✓</span> TLS 1.3 encryption in transit</li>
                  <li className="flex items-center gap-2"><span className="text-green-400">✓</span> OAuth tokens encrypted with AES-256-GCM</li>
                  <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Point-in-time recovery backups</li>
                  <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Firewall and DDoS protection</li>
                  <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Automated vulnerability scanning</li>
                </ul>
              </div>
              <div className="bg-slate-700 rounded-lg p-5">
                <h4 className="font-semibold text-white mb-3">Organizational Measures</h4>
                <ul className="text-slate-300 text-sm space-y-2">
                  <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Role-based access control</li>
                  <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Employee confidentiality agreements</li>
                  <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Security awareness training</li>
                  <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Incident response procedures</li>
                  <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Regular security audits</li>
                  <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Vendor security assessments</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">Sub-processors</h2>
            <p className="text-slate-300 mb-4">
              We use the following sub-processors to deliver our service. All sub-processors are 
              bound by data processing agreements with equivalent protections:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-3 px-4 text-slate-400">Sub-processor</th>
                    <th className="text-left py-3 px-4 text-slate-400">Purpose</th>
                    <th className="text-left py-3 px-4 text-slate-400">Location</th>
                    <th className="text-left py-3 px-4 text-slate-400">Transfer</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-slate-700">
                    <td className="py-3 px-4">Google Cloud Platform</td>
                    <td className="py-3 px-4">Infrastructure</td>
                    <td className="py-3 px-4">🇺🇸 United States</td>
                    <td className="py-3 px-4"><span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">SCCs</span></td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-3 px-4">Google (Gemini API)</td>
                    <td className="py-3 px-4">AI Translation</td>
                    <td className="py-3 px-4">🇺🇸 United States</td>
                    <td className="py-3 px-4"><span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">SCCs</span></td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-3 px-4">Stripe</td>
                    <td className="py-3 px-4">Payments</td>
                    <td className="py-3 px-4">🇺🇸 United States</td>
                    <td className="py-3 px-4"><span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">SCCs</span></td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-3 px-4">Sentry</td>
                    <td className="py-3 px-4">Error Monitoring</td>
                    <td className="py-3 px-4">🇺🇸 United States</td>
                    <td className="py-3 px-4"><span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">SCCs</span></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Firebase</td>
                    <td className="py-3 px-4">Authentication</td>
                    <td className="py-3 px-4">🇺🇸 United States</td>
                    <td className="py-3 px-4"><span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">SCCs</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">AI Processing Considerations</h2>
            <p className="text-slate-300 mb-4">
              Melaka uses AI (Google Gemini) for translations. Important considerations:
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { title: 'No Training', desc: 'Your data is NOT used to train AI models', icon: '🚫' },
                { title: 'Transient Processing', desc: 'Content is processed and immediately discarded', icon: '⚡' },
                { title: 'No Profiling', desc: 'We do not use AI to make automated decisions about individuals', icon: '👤' },
                { title: 'Human Override', desc: 'All translations can be manually edited', icon: '✏️' },
              ].map((item, i) => (
                <div key={i} className="bg-slate-700 rounded-lg p-4 flex gap-3">
                  <div className="text-2xl">{item.icon}</div>
                  <div>
                    <h4 className="font-semibold text-white">{item.title}</h4>
                    <p className="text-slate-400 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">Data Breach Notification</h2>
            <p className="text-slate-300 mb-4">In the event of a personal data breach, we will:</p>
            <ul className="text-slate-300 space-y-2 list-disc list-inside">
              <li>Notify you within <strong className="text-white">72 hours</strong> of becoming aware</li>
              <li>Provide details of the breach, affected data, and remediation steps</li>
              <li>Cooperate with your notification obligations to supervisory authorities</li>
              <li>Document the breach and our response for audit purposes</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">Contact & Complaints</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-700 rounded-lg p-5">
                <h4 className="font-semibold text-white mb-2">Data Protection Contact</h4>
                <p className="text-slate-400 text-sm mb-3">For privacy inquiries and data requests:</p>
                <a href="mailto:privacy@melaka.dev" className="text-blue-400 hover:underline">privacy@melaka.dev</a>
              </div>
              <div className="bg-slate-700 rounded-lg p-5">
                <h4 className="font-semibold text-white mb-2">Supervisory Authority</h4>
                <p className="text-slate-400 text-sm mb-3">You have the right to lodge a complaint with your local data protection authority.</p>
                <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" target="_blank" rel="noopener" className="text-blue-400 hover:underline text-sm">Find your DPA →</a>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Documentation</h2>
            <p className="text-slate-300 mb-4">The following documents support our GDPR compliance:</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/privacy" className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2 rounded-lg transition-colors">
                Privacy Policy
              </Link>
              <Link href="/dpa" className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2 rounded-lg transition-colors">
                Data Processing Agreement
              </Link>
              <Link href="/terms" className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2 rounded-lg transition-colors">
                Terms of Service
              </Link>
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-8 bg-blue-600 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Need a Data Processing Agreement?</h3>
          <p className="text-blue-100 mb-6">
            Download our standard DPA or request a countersigned copy for your records.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/dpa"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              View DPA
            </Link>
            <a 
              href="mailto:dpa@melaka.dev?subject=Signed%20DPA%20Request"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-400 transition-colors"
            >
              Request Signed Copy
            </a>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-6 text-sm text-slate-400">
          <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white">Terms of Service</Link>
          <Link href="/dpa" className="hover:text-white">Data Processing Agreement</Link>
        </div>
      </div>
    </div>
  );
}
