import type { PrismaClient } from '@prisma/client';

let prismaInstance: PrismaClient | null = null;

export async function getPrisma(): Promise<PrismaClient> {
  const url = process.env.DATABASE_URL;

  if (!url?.startsWith('prisma+postgres://')) {
    const prefix = url ? url.slice(0, 20) : 'undefined';
    throw new Error(`DATABASE_URL missing or invalid in this runtime (prefix=${prefix})`);
  }

  if (!prismaInstance) {
    const { PrismaClient } = await import('@prisma/client');
    prismaInstance = new PrismaClient({
      datasources: {
        db: { url },
      },
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  return prismaInstance;
}
