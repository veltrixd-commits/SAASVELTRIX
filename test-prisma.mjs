import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env.development.local', 'utf8');
const urlMatch = envContent.match(/^DATABASE_URL="?([^"\n]+)"?/m);
const url = urlMatch?.[1];
console.log('URL prefix:', url?.slice(0, 60));

const prisma = new PrismaClient({ datasources: { db: { url } } }).$extends(withAccelerate());

console.log('Querying...');
const start = Date.now();
try {
  const count = await prisma.user.count();
  console.log('SUCCESS - User count:', count, 'in', Date.now() - start, 'ms');
} catch (e) {
  console.error('FAILED after', Date.now() - start, 'ms:', e.message);
}
process.exit(0);
