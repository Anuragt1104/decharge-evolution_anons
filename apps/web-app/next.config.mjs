const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  transpilePackages: [
    "@decharge/sdk",
    "@decharge/types",
    "@decharge/ui",
    "@decharge/utils"
  ],
};

export default nextConfig;