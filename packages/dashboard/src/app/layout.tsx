import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Melaka Dashboard',
  description: 'Translation review dashboard for Melaka',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
