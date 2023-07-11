/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.fih.io'
      },
      {
        protocol: 'https',
        hostname: '**.trvl-media.com'
      },
      {
        protocol: 'https',
        hostname: '**.hotelbeds.com'
      },
      {
        protocol: 'https',
        hostname: '**.travelapi.com'
      },
      {
        protocol: 'https',
        hostname: '**.bstatic.com'
      },
    ],
  },
}

module.exports = nextConfig
