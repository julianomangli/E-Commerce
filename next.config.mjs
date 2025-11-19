/** @type {import('next').NextConfig} */
export default {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tailwindcss.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tailwindui.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'files.cdn.printful.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'printful-upload.s3-accelerate.amazonaws.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000']
    },
  },
}
