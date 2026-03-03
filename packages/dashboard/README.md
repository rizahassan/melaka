# @melaka/dashboard

Web UI for reviewing and managing Melaka translations.

## Features

- 📝 **Translation Review** - Side-by-side source/translation view
- ✓ **Mark as Reviewed** - Track reviewed translations
- ✏️ **Edit Translations** - Fix or improve translations
- 📊 **Analytics** - Translation statistics and progress
- 🔗 **Firebase Integration** - Connect to your Firestore

## Getting Started

### Development

```bash
# From monorepo root
pnpm install

# Start dashboard
cd packages/dashboard
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Configuration

The dashboard reads from your Firebase project. Configure in the Settings page or set environment variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

## Pages

- `/` - Dashboard home with stats and quick actions
- `/translations` - Translation review with side-by-side view
- `/analytics` - Statistics, progress, and activity
- `/settings` - Firebase connection and configuration

## Tech Stack

- **Next.js 15** - React framework
- **Tailwind CSS 4** - Styling
- **Firebase** - Client SDK for Firestore
- **TypeScript** - Type safety

## Deployment

### Vercel (Recommended)

```bash
npx vercel
```

### Self-hosted

```bash
pnpm build
pnpm start
```

## License

MIT
