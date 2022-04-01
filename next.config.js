/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['www.arweave.net', 'arweave.net', 'ipfs.io', 'cdn.blastctrl.com']
  },
  webpack5: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false
    }
    return config
  }
}

module.exports = nextConfig
