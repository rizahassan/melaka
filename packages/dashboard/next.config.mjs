import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@melaka/core', '@melaka/cloud'],
  output: 'standalone',
};

export default withSentryConfig(nextConfig, {
  // Sentry webpack plugin options
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  
  // Only upload source maps in CI
  silent: !process.env.CI,
  
  // Upload source maps for better stack traces
  widenClientFileUpload: true,
  
  // Hide source maps from browser devtools
  hideSourceMaps: true,
  
  // Disable logger for cleaner output
  disableLogger: true,
  
  // Auto-instrument API routes
  automaticVercelMonitors: true,
});
