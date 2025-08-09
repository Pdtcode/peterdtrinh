/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.screenshotmachine.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
