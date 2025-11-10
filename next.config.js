/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary (pour hébergement d'images)
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      // Unsplash (pour images de démo)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // GitHub (pour avatars)
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      // Vercel Blob Storage
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      // Ajoutez d'autres domaines si nécessaire
    ],
  },
}

module.exports = nextConfig
