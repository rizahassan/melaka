/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@melaka/core', '@melaka/cloud'],
  output: 'standalone',
};

module.exports = nextConfig;
