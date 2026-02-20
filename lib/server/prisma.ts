import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

let prismaInstance: PrismaClient | null = null;

export async function getPrisma(): Promise<PrismaClient> {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error('DATABASE_URL is not set in environment variables');
  }

  // Accept both prisma+postgres:// (Accelerate) and legacy prisma:// (Data Proxy)
  const isAccelerateUrl = url.startsWith('prisma+postgres://') || url.startsWith('prisma://');
  if (!isAccelerateUrl) {
    const prefix = url.slice(0, 30);
    throw new Error(`DATABASE_URL must be a Prisma Accelerate URL (got prefix: ${prefix})`);
  }

  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      datasources: { db: { url } },
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    }).$extends(withAccelerate()) as unknown as PrismaClient;
  }

  return prismaInstance;
}

