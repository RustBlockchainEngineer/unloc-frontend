/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "www.arweave.net",
      "arweave.net",
      "ipfs.io",
      "cdn.blastctrl.com",
      "s3.eu-central-1.amazonaws.com",
    ],
  },
  webpack5: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    return config;
  },
};

module.exports = nextConfig;
