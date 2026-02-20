import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

let prismaInstance: PrismaClient | null = null;

function resolveAccelerateUrl(): string {
  const raw = process.env.DATABASE_URL ?? '';
  const fallback = process.env.POSTGRES_PRISMA_URL ?? '';

  // Use whichever value starts with the correct Accelerate prefix
  if (raw.startsWith('prisma+postgres://')) return raw;
  if (fallback.startsWith('prisma+postgres://')) return fallback;

  throw new Error(
    `No valid Prisma Accelerate URL found. ` +
    `DATABASE_URL prefix="${raw.slice(0, 30)}", ` +
    `POSTGRES_PRISMA_URL prefix="${fallback.slice(0, 30)}". ` +
    `Both must start with prisma+postgres://`
  );
}

export async function getPrisma(): Promise<PrismaClient> {
  if (!prismaInstance) {
    const url = resolveAccelerateUrl();
    prismaInstance = new PrismaClient({
      datasources: { db: { url } },
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    }).$extends(withAccelerate()) as unknown as PrismaClient;
  }

  return prismaInstance;
}

