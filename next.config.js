/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: [
      'localhost',
      'scontent.cdninstagram.com',
      'scontent.xx.fbcdn.net',
      'pbs.twimg.com',
      'media.licdn.com',
      'p16-sign-va.tiktokcdn.com',
      'p16-sign.tiktokcdn-us.com',
    ],
  },
};

module.exports = nextConfig;
