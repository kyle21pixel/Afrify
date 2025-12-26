/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@afrify/shared'],
  images: {
    domains: ['localhost', 'afrify-storage.s3.amazonaws.com'],
  },
}

module.exports = nextConfig
