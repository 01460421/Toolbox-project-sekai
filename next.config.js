/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.sekai.best',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'sekai-res.dnaroma.eu',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'minio.dnaroma.eu',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
