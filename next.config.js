/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "gravatar.com",
      "images.unsplash.com", //Unplash
      "plus.unsplash.com",
      "scontent-qro1-2.xx.fbcdn.net", //Facebook
      //"scontent.fmex27-1.fna.fbcdn.net", //FB domain
    ],
  },
};

module.exports = nextConfig;
