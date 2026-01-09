/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.worldofbooks.com',
            },
            {
                protocol: 'https',
                hostname: 'images.worldofbooks.com',
            },
            {
                protocol: 'https',
                hostname: 'image-server.worldofbooks.com',
            },
        ],
        unoptimized: process.env.NODE_ENV === 'production',
    },
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    },
};

module.exports = nextConfig;
