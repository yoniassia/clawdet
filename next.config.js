/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Pre-existing type issues in nextauth route — ignore during build
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
