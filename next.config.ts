import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Fix for WebSocket and bufferutil in Node.js environment
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'bufferutil': 'commonjs bufferutil',
        'utf-8-validate': 'commonjs utf-8-validate',
      });
    }
    return config;
  },
};

export default nextConfig;
