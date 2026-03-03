/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  // Exclude native modules from webpack bundling
  serverExternalPackages: ['better-sqlite3'],
  // Force all pages to be dynamic (SSR) — we use SQLite which can't be statically generated
  experimental: {},
}

module.exports = nextConfig
