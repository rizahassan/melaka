import Link from 'next/link';

export const metadata = {
  title: 'Documentation | Melaka',
  description: 'Learn how to use Melaka for AI-powered localization',
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link href="/" className="text-2xl font-bold text-white">
            🌏 Melaka
          </Link>
          <span className="text-slate-400 ml-4">Documentation</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">Documentation</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Everything you need to integrate AI-powered translations into your Firebase app.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-4 gap-4 mb-16">
          {[
            { href: '#quick-start', icon: '🚀', title: 'Quick Start', desc: '5-minute setup' },
            { href: '#sdk', icon: '📦', title: 'SDK Usage', desc: 'Self-hosted setup' },
            { href: '#cli', icon: '⌨️', title: 'CLI Commands', desc: 'Command reference' },
            { href: '#api', icon: '🔌', title: 'API Reference', desc: 'REST endpoints' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl p-6 transition-colors"
            >
              <div className="text-3xl mb-2">{link.icon}</div>
              <div className="text-white font-semibold">{link.title}</div>
              <div className="text-slate-400 text-sm">{link.desc}</div>
            </a>
          ))}
        </div>

        {/* Quick Start */}
        <section id="quick-start" className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-4xl">🚀</span> Quick Start
          </h2>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
            <p className="text-slate-300 mb-8">Get up and running with Melaka Cloud in 5 minutes.</p>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Sign up for Melaka Cloud</h3>
                  <p className="text-slate-400">
                    Create an account at <Link href="/login" className="text-blue-400 hover:underline">melaka.dev</Link> and 
                    start your 14-day free trial. No credit card required.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Connect your Firebase project</h3>
                  <p className="text-slate-400">
                    Click "Connect Project" and authorize Melaka to access your Firestore database.
                    We use OAuth so your credentials stay secure.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Configure collections</h3>
                  <p className="text-slate-400 mb-4">
                    Select which collections and fields you want to translate. Set your source language and target languages.
                  </p>
                  <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg text-sm overflow-x-auto border border-slate-600">
{`{
  "collections": [
    {
      "path": "products",
      "fields": ["name", "description"],
      "enabled": true
    }
  ],
  "sourceLocale": "en",
  "targetLocales": ["es", "fr", "de", "ja"]
}`}
                  </pre>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">4</div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Trigger translations</h3>
                  <p className="text-slate-400">
                    Use the dashboard to manually trigger translations, or set up automatic translation on document changes.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">5</div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Access translations</h3>
                  <p className="text-slate-400 mb-4">
                    Translations are stored in an <code className="bg-slate-700 px-2 py-0.5 rounded text-blue-300">i18n</code> subcollection under each document:
                  </p>
                  <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg text-sm overflow-x-auto border border-slate-600">
{`// Original document
/products/abc123
  name: "Wireless Headphones"
  description: "Premium sound quality"

// Translations
/products/abc123/i18n/es
  name: "Auriculares Inalámbricos"
  description: "Calidad de sonido premium"

/products/abc123/i18n/ja
  name: "ワイヤレスヘッドフォン"
  description: "プレミアム音質"`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SDK Usage */}
        <section id="sdk" className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-4xl">📦</span> SDK Usage (Self-Hosted)
          </h2>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
            <p className="text-slate-300 mb-8">For self-hosted deployments, use the Melaka SDK directly.</p>

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Installation</h3>
                <pre className="bg-slate-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto border border-slate-600">
npm install @melaka/core @melaka/ai
                </pre>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Basic Usage</h3>
                <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg text-sm overflow-x-auto border border-slate-600">
{`import { Melaka } from '@melaka/core';
import { GeminiProvider } from '@melaka/ai';

const melaka = new Melaka({
  provider: new GeminiProvider({
    apiKey: process.env.GEMINI_API_KEY,
  }),
  sourceLocale: 'en',
  targetLocales: ['es', 'fr', 'de'],
});

// Translate a single field
const result = await melaka.translate({
  text: 'Hello, world!',
  targetLocale: 'es',
});
console.log(result); // "¡Hola, mundo!"

// Translate multiple fields
const fields = await melaka.translateFields({
  fields: {
    title: 'Welcome to our store',
    description: 'Find the best products here',
  },
  targetLocale: 'fr',
});`}
                </pre>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Firestore Integration</h3>
                <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg text-sm overflow-x-auto border border-slate-600">
{`import { MelakaFirestore } from '@melaka/firestore';

const melakaFs = new MelakaFirestore({
  firestore: admin.firestore(),
  melaka: melaka,
  collections: [
    { path: 'products', fields: ['name', 'description'] },
    { path: 'categories', fields: ['title'] },
  ],
});

// Listen for changes and auto-translate
await melakaFs.startListener();

// Or translate a specific document
await melakaFs.translateDocument('products/abc123', ['es', 'fr']);`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* CLI Commands */}
        <section id="cli" className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-4xl">⌨️</span> CLI Commands
          </h2>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-3">Installation</h3>
              <pre className="bg-slate-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto border border-slate-600">
npm install -g @melaka/cli
              </pre>
            </div>

            <div className="space-y-6">
              {/* melaka init */}
              <div className="border-b border-slate-700 pb-6">
                <h3 className="text-lg font-mono text-blue-400 mb-2">melaka init</h3>
                <p className="text-slate-400 mb-3">Initialize a new Melaka project in the current directory.</p>
                <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg text-sm overflow-x-auto border border-slate-600">
{`$ melaka init

? What is your source locale? en
? What are your target locales? es, fr, de, ja
? Which AI provider? gemini
? Enter your Gemini API key: ********

✓ Created melaka.config.json
✓ Project initialized successfully!`}
                </pre>
                <div className="mt-3 text-sm text-slate-500">
                  <strong className="text-slate-400">Creates:</strong> melaka.config.json with your translation settings
                </div>
              </div>

              {/* melaka translate */}
              <div className="border-b border-slate-700 pb-6">
                <h3 className="text-lg font-mono text-blue-400 mb-2">melaka translate</h3>
                <p className="text-slate-400 mb-3">Translate a JSON file to multiple languages.</p>
                <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg text-sm overflow-x-auto border border-slate-600">
{`$ melaka translate input.json -o ./locales -t es,fr,de

Translating input.json...
✓ Created locales/es.json (42 fields)
✓ Created locales/fr.json (42 fields)
✓ Created locales/de.json (42 fields)

Done! Translated 126 fields total.`}
                </pre>
                <div className="mt-3">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-400">
                        <th className="pb-2">Option</th>
                        <th className="pb-2">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      <tr><td className="py-1 font-mono text-yellow-400">-o, --output</td><td>Output directory (default: ./)</td></tr>
                      <tr><td className="py-1 font-mono text-yellow-400">-t, --target</td><td>Target locales (comma-separated)</td></tr>
                      <tr><td className="py-1 font-mono text-yellow-400">-s, --source</td><td>Source locale (default: from config)</td></tr>
                      <tr><td className="py-1 font-mono text-yellow-400">--flatten</td><td>Flatten nested keys in output</td></tr>
                      <tr><td className="py-1 font-mono text-yellow-400">--dry-run</td><td>Preview without writing files</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* melaka firestore */}
              <div className="border-b border-slate-700 pb-6">
                <h3 className="text-lg font-mono text-blue-400 mb-2">melaka firestore translate</h3>
                <p className="text-slate-400 mb-3">Translate all documents in a Firestore collection.</p>
                <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg text-sm overflow-x-auto border border-slate-600">
{`$ melaka firestore translate --collection products --locales es,fr

Fetching documents from 'products'...
Found 156 documents.

Translating to es... ████████████████████ 100%
Translating to fr... ████████████████████ 100%

✓ Translated 312 documents (624 fields)`}
                </pre>
                <div className="mt-3">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-400">
                        <th className="pb-2">Option</th>
                        <th className="pb-2">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      <tr><td className="py-1 font-mono text-yellow-400">--collection</td><td>Collection path to translate</td></tr>
                      <tr><td className="py-1 font-mono text-yellow-400">--locales</td><td>Target locales (comma-separated)</td></tr>
                      <tr><td className="py-1 font-mono text-yellow-400">--fields</td><td>Specific fields to translate</td></tr>
                      <tr><td className="py-1 font-mono text-yellow-400">--project</td><td>Firebase project ID</td></tr>
                      <tr><td className="py-1 font-mono text-yellow-400">--batch-size</td><td>Documents per batch (default: 50)</td></tr>
                      <tr><td className="py-1 font-mono text-yellow-400">--force</td><td>Re-translate existing translations</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* melaka firestore listen */}
              <div className="border-b border-slate-700 pb-6">
                <h3 className="text-lg font-mono text-blue-400 mb-2">melaka firestore listen</h3>
                <p className="text-slate-400 mb-3">Watch a collection and auto-translate new/updated documents.</p>
                <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg text-sm overflow-x-auto border border-slate-600">
{`$ melaka firestore listen --collection products

🎧 Listening for changes on 'products'...
   Target locales: es, fr, de, ja

[12:34:56] Document 'products/abc123' created
           → Translating to 4 locales...
           ✓ Translations saved

[12:35:12] Document 'products/xyz789' updated
           → Field 'description' changed
           ✓ Translations updated

Press Ctrl+C to stop.`}
                </pre>
                <div className="mt-3">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-400">
                        <th className="pb-2">Option</th>
                        <th className="pb-2">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      <tr><td className="py-1 font-mono text-yellow-400">--collection</td><td>Collection path to watch</td></tr>
                      <tr><td className="py-1 font-mono text-yellow-400">--recursive</td><td>Include subcollections</td></tr>
                      <tr><td className="py-1 font-mono text-yellow-400">--debounce</td><td>Debounce time in ms (default: 1000)</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* melaka status */}
              <div className="border-b border-slate-700 pb-6">
                <h3 className="text-lg font-mono text-blue-400 mb-2">melaka status</h3>
                <p className="text-slate-400 mb-3">Check translation status and usage statistics.</p>
                <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg text-sm overflow-x-auto border border-slate-600">
{`$ melaka status

Project: my-firebase-app
Plan: Pro ($49/mo)

Usage This Month:
  Translations: 4,521 / 10,000 (45.2%)
  ████████░░░░░░░░░░░░

Pending Jobs: 0
Failed Jobs: 2

Recent Activity:
  • 2 hours ago: products/abc123 → es, fr, de, ja ✓
  • 3 hours ago: categories/tech → es, fr ✓
  • 5 hours ago: products/xyz789 → ja ✗ (rate limited)`}
                </pre>
              </div>

              {/* melaka export */}
              <div className="border-b border-slate-700 pb-6">
                <h3 className="text-lg font-mono text-blue-400 mb-2">melaka export</h3>
                <p className="text-slate-400 mb-3">Export translations from Firestore to JSON files.</p>
                <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg text-sm overflow-x-auto border border-slate-600">
{`$ melaka export --collection products --output ./exports

Exporting translations from 'products'...

✓ Created exports/products_en.json (156 documents)
✓ Created exports/products_es.json (156 documents)
✓ Created exports/products_fr.json (156 documents)
✓ Created exports/products_de.json (156 documents)

Done! Exported 624 files.`}
                </pre>
                <div className="mt-3">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-400">
                        <th className="pb-2">Option</th>
                        <th className="pb-2">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      <tr><td className="py-1 font-mono text-yellow-400">--collection</td><td>Collection to export</td></tr>
                      <tr><td className="py-1 font-mono text-yellow-400">--output</td><td>Output directory</td></tr>
                      <tr><td className="py-1 font-mono text-yellow-400">--format</td><td>Output format: json, csv, xliff</td></tr>
                      <tr><td className="py-1 font-mono text-yellow-400">--locales</td><td>Specific locales to export</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* melaka import */}
              <div className="border-b border-slate-700 pb-6">
                <h3 className="text-lg font-mono text-blue-400 mb-2">melaka import</h3>
                <p className="text-slate-400 mb-3">Import translations from JSON files into Firestore.</p>
                <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg text-sm overflow-x-auto border border-slate-600">
{`$ melaka import ./translations --collection products --locale es

Importing translations to 'products'...

Reading ./translations/es.json...
Found 156 translation entries.

Importing... ████████████████████ 100%

✓ Imported 156 translations to 'products/*/i18n/es'`}
                </pre>
              </div>

              {/* melaka config */}
              <div>
                <h3 className="text-lg font-mono text-blue-400 mb-2">melaka config</h3>
                <p className="text-slate-400 mb-3">View or modify configuration.</p>
                <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg text-sm overflow-x-auto border border-slate-600">
{`$ melaka config list

Current Configuration:
  sourceLocale: en
  targetLocales: es, fr, de, ja
  provider: gemini
  model: gemini-2.5-flash

$ melaka config set targetLocales es,fr,de,ja,ko,zh

✓ Updated targetLocales`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* API Reference */}
        <section id="api" className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-4xl">🔌</span> API Reference
          </h2>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
            <p className="text-slate-300 mb-6">
              Base URL: <code className="bg-slate-700 px-2 py-1 rounded text-green-400">https://melaka.dev/api</code>
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-slate-600">
                    <th className="py-3 px-4 text-slate-400">Endpoint</th>
                    <th className="py-3 px-4 text-slate-400">Method</th>
                    <th className="py-3 px-4 text-slate-400">Description</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-slate-700">
                    <td className="py-3 px-4 font-mono text-blue-400">/projects</td>
                    <td className="py-3 px-4"><span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs">GET</span></td>
                    <td className="py-3 px-4">List all projects</td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-3 px-4 font-mono text-blue-400">/projects</td>
                    <td className="py-3 px-4"><span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs">POST</span></td>
                    <td className="py-3 px-4">Create a new project</td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-3 px-4 font-mono text-blue-400">/projects/:id</td>
                    <td className="py-3 px-4"><span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs">GET</span></td>
                    <td className="py-3 px-4">Get project details</td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-3 px-4 font-mono text-blue-400">/projects/:id</td>
                    <td className="py-3 px-4"><span className="bg-yellow-600 text-white px-2 py-0.5 rounded text-xs">PATCH</span></td>
                    <td className="py-3 px-4">Update project settings</td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-3 px-4 font-mono text-blue-400">/translations/trigger</td>
                    <td className="py-3 px-4"><span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs">POST</span></td>
                    <td className="py-3 px-4">Trigger translation job</td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-3 px-4 font-mono text-blue-400">/translations/status</td>
                    <td className="py-3 px-4"><span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs">GET</span></td>
                    <td className="py-3 px-4">Get translation job status</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-blue-400">/usage</td>
                    <td className="py-3 px-4"><span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs">GET</span></td>
                    <td className="py-3 px-4">Get usage statistics</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Supported Languages */}
        <section id="languages" className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-4xl">🌍</span> Supported Languages
          </h2>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
            <p className="text-slate-300 mb-6">
              Melaka supports 100+ languages through AI. Common languages include:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                'English (en)', 'Spanish (es)', 'French (fr)', 'German (de)',
                'Japanese (ja)', 'Korean (ko)', 'Chinese (zh)', 'Portuguese (pt)',
                'Italian (it)', 'Dutch (nl)', 'Russian (ru)', 'Arabic (ar)',
                'Hindi (hi)', 'Thai (th)', 'Vietnamese (vi)', 'Indonesian (id)',
                'Malay (ms)', 'Turkish (tr)', 'Polish (pl)', 'Swedish (sv)',
              ].map((lang) => (
                <div key={lang} className="bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm">{lang}</div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-4xl">❓</span> FAQ
          </h2>
          <div className="bg-slate-800 border border-slate-700 rounded-xl divide-y divide-slate-700">
            {[
              {
                q: 'How does billing work?',
                a: "You're billed based on the number of translations per month. Each field translated to one language counts as one translation. Unused translations don't roll over."
              },
              {
                q: 'Is my data secure?',
                a: 'Yes. We use OAuth to access your Firestore — we never store your Firebase credentials. All data is encrypted in transit and at rest.'
              },
              {
                q: 'Can I use my own AI API keys?',
                a: 'With the self-hosted SDK, yes — you can use your own Gemini, OpenAI, or Claude API keys. Melaka Cloud uses our managed AI infrastructure.'
              },
              {
                q: 'How accurate are the translations?',
                a: 'We use state-of-the-art AI models (Gemini 2.5 Flash) that provide high-quality, context-aware translations. For critical content, we recommend human review.'
              },
              {
                q: 'Can I edit translations?',
                a: 'Yes! Translations are stored in your Firestore database. You can edit them directly in the Firebase Console or programmatically.'
              },
              {
                q: 'What happens if I exceed my limit?',
                a: "You'll receive a warning at 80% usage. If you exceed your limit, new translation requests will be queued until the next billing cycle or you upgrade your plan."
              },
            ].map((item, i) => (
              <div key={i} className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">{item.q}</h3>
                <p className="text-slate-400">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-slate-400 border-t border-slate-700 pt-8">
          <p className="mb-4">
            Need help? Contact us at{' '}
            <a href="mailto:support@melaka.dev" className="text-blue-400 hover:underline">
              support@melaka.dev
            </a>
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
            <Link href="/pricing" className="hover:text-white">Pricing</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
