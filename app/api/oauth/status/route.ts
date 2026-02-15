import { NextResponse } from 'next/server';

export async function GET() {
  const status = {
    tiktok: {
      configured: Boolean(process.env.TIKTOK_APP_ID && process.env.TIKTOK_APP_SECRET),
      missing: [
        !process.env.TIKTOK_APP_ID ? 'TIKTOK_APP_ID' : null,
        !process.env.TIKTOK_APP_SECRET ? 'TIKTOK_APP_SECRET' : null,
      ].filter(Boolean),
    },
    instagram: {
      configured: Boolean(
        (process.env.INSTAGRAM_APP_ID || process.env.FACEBOOK_APP_ID) &&
        (process.env.INSTAGRAM_APP_SECRET || process.env.FACEBOOK_APP_SECRET)
      ),
      missing: [
        !(process.env.INSTAGRAM_APP_ID || process.env.FACEBOOK_APP_ID) ? 'INSTAGRAM_APP_ID (or FACEBOOK_APP_ID)' : null,
        !(process.env.INSTAGRAM_APP_SECRET || process.env.FACEBOOK_APP_SECRET) ? 'INSTAGRAM_APP_SECRET (or FACEBOOK_APP_SECRET)' : null,
      ].filter(Boolean),
    },
    facebook: {
      configured: Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET),
      missing: [
        !process.env.FACEBOOK_APP_ID ? 'FACEBOOK_APP_ID' : null,
        !process.env.FACEBOOK_APP_SECRET ? 'FACEBOOK_APP_SECRET' : null,
      ].filter(Boolean),
    },
    whatsapp: {
      configured: Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET),
      missing: [
        !process.env.FACEBOOK_APP_ID ? 'FACEBOOK_APP_ID' : null,
        !process.env.FACEBOOK_APP_SECRET ? 'FACEBOOK_APP_SECRET' : null,
      ].filter(Boolean),
    },
    linkedin: {
      configured: Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET),
      missing: [
        !process.env.LINKEDIN_CLIENT_ID ? 'LINKEDIN_CLIENT_ID' : null,
        !process.env.LINKEDIN_CLIENT_SECRET ? 'LINKEDIN_CLIENT_SECRET' : null,
      ].filter(Boolean),
    },
    twitter: {
      configured: Boolean(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET),
      missing: [
        !process.env.TWITTER_CLIENT_ID ? 'TWITTER_CLIENT_ID' : null,
        !process.env.TWITTER_CLIENT_SECRET ? 'TWITTER_CLIENT_SECRET' : null,
      ].filter(Boolean),
    },
  };

  const configuredCount = Object.values(status).filter((item) => item.configured).length;

  return NextResponse.json({
    status,
    configuredCount,
    total: Object.keys(status).length,
  });
}
