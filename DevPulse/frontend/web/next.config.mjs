/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enables the standalone build for Docker optimization
  output: 'standalone', 
  
  // This is critical for Prisma 7 + Next 16
  serverExternalPackages: ['@prisma/client', 'pg'],
}

export default nextConfig