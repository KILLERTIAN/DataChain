import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  disable: false,
});

// Your Next config is automatically typed!
export default withPWA({
  // Removed output: "export" to enable API routes
  distDir: "./dist", // Changes the build output directory to `./dist/`.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH, // Sets the base path to `/some-base-path`.
  images: { unoptimized: true },
  
  // Enable API routes and server-side functionality
  experimental: {
    serverComponentsExternalPackages: ['pinata']
  }
});
