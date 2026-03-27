import Link from 'next/link';

export const metadata = {
  title: 'Documentation | Melaka',
  description: 'Learn how to use Melaka for AI-powered localization',
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Documentation</h1>
        
        {/* Quick Start */}
        <section className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">🚀 Quick Start</h2>
          <p className="text-gray-600 mb-6">Get up and running with Melaka in 5 minutes.</p>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">1. Sign up for Melaka Cloud</h3>
              <p className="text-gray-600 mb-2">
                Create an account at <Link href="/login" className="text-blue-600 hover:underline">melaka.dev</Link> and 
                start your 14-day free trial. No credit card required.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">2. Connect your Firebase project</h3>
              <p className="text-gray-600 mb-2">
                Click "Connect Project" and authorize Melaka to access your Firestore database.
                We use OAuth so your credentials stay secure.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">3. Configure collections</h3>
              <p className="text-gray-600 mb-2">
                Select which collections and fields you want to translate. Set your source language
                and target languages.
              </p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`// Example configuration
{
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
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">4. Trigger translations</h3>
              <p className="text-gray-600 mb-2">
                Use the dashboard to manually trigger translations, or set up automatic translation
                on document changes.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">5. Access translations</h3>
              <p className="text-gray-600 mb-2">
                Translations are stored in an <code className="bg-gray-100 px-1 rounded">i18n</code> subcollection 
                under each document:
              </p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
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
        </section>

        {/* SDK Usage */}
        <section className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">📦 SDK Usage (Self-Hosted)</h2>
          <p className="text-gray-600 mb-6">
            For self-hosted deployments, use the Melaka SDK directly.
          </p>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Installation</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`npm install @melaka/core @melaka/ai`}
              </pre>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Basic Usage</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Firestore Integration</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
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
        </section>

        {/* CLI */}
        <section className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">⌨️ CLI Commands</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Installation</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`npm install -g @melaka/cli`}
              </pre>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Commands</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`# Initialize a new project
melaka init

# Translate a JSON file
melaka translate input.json -o output.json -t es,fr,de

# Translate all documents in a collection
melaka firestore translate --collection products --locales es,fr

# Check translation status
melaka status

# Export translations
melaka export --format json --output ./translations`}
              </pre>
            </div>
          </div>
        </section>

        {/* API Reference */}
        <section className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">🔌 API Reference</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">REST API (Melaka Cloud)</h3>
              <p className="text-gray-600 mb-4">
                Base URL: <code className="bg-gray-100 px-1 rounded">https://melaka.dev/api</code>
              </p>
              
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Endpoint</th>
                      <th className="px-4 py-2 text-left">Method</th>
                      <th className="px-4 py-2 text-left">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="px-4 py-2 font-mono text-xs">/projects</td>
                      <td className="px-4 py-2">GET</td>
                      <td className="px-4 py-2">List all projects</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-xs">/projects</td>
                      <td className="px-4 py-2">POST</td>
                      <td className="px-4 py-2">Create a new project</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-xs">/projects/:id</td>
                      <td className="px-4 py-2">GET</td>
                      <td className="px-4 py-2">Get project details</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-xs">/translations/trigger</td>
                      <td className="px-4 py-2">POST</td>
                      <td className="px-4 py-2">Trigger translation job</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-xs">/translations/status</td>
                      <td className="px-4 py-2">GET</td>
                      <td className="px-4 py-2">Get translation status</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono text-xs">/usage</td>
                      <td className="px-4 py-2">GET</td>
                      <td className="px-4 py-2">Get usage statistics</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Supported Languages */}
        <section className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">🌍 Supported Languages</h2>
          <p className="text-gray-600 mb-4">
            Melaka supports 100+ languages through our AI providers. Common languages include:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            {[
              'English (en)', 'Spanish (es)', 'French (fr)', 'German (de)',
              'Japanese (ja)', 'Korean (ko)', 'Chinese (zh)', 'Portuguese (pt)',
              'Italian (it)', 'Dutch (nl)', 'Russian (ru)', 'Arabic (ar)',
              'Hindi (hi)', 'Thai (th)', 'Vietnamese (vi)', 'Indonesian (id)',
              'Malay (ms)', 'Turkish (tr)', 'Polish (pl)', 'Swedish (sv)',
            ].map((lang) => (
              <div key={lang} className="bg-gray-50 px-3 py-2 rounded">{lang}</div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">❓ FAQ</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">How does billing work?</h3>
              <p className="text-gray-600">
                You're billed based on the number of translations per month. Each field translated 
                to one language counts as one translation. Unused translations don't roll over.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Is my data secure?</h3>
              <p className="text-gray-600">
                Yes. We use OAuth to access your Firestore — we never store your Firebase credentials. 
                All data is encrypted in transit and at rest. See our{' '}
                <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link> for details.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Can I use my own AI API keys?</h3>
              <p className="text-gray-600">
                With the self-hosted SDK, yes — you can use your own Gemini, OpenAI, or Claude API keys. 
                Melaka Cloud uses our managed AI infrastructure.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">How accurate are the translations?</h3>
              <p className="text-gray-600">
                We use state-of-the-art AI models (Gemini 2.5 Flash) that provide high-quality, 
                context-aware translations. For critical content, we recommend human review.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Can I edit translations?</h3>
              <p className="text-gray-600">
                Yes! Translations are stored in your Firestore database. You can edit them directly 
                in the Firebase Console or programmatically.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">What happens if I exceed my limit?</h3>
              <p className="text-gray-600">
                You'll receive a warning at 80% usage. If you exceed your limit, new translation 
                requests will be queued until the next billing cycle or you upgrade your plan.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 text-center text-gray-500">
          <p>
            Need help? Contact us at{' '}
            <a href="mailto:support@melaka.dev" className="text-blue-600 hover:underline">
              support@melaka.dev
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
