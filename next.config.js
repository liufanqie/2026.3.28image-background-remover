/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for Cloudflare Pages
  output: 'export',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
