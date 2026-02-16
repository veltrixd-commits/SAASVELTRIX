import { randomUUID } from 'crypto';
import type { OAuthResultRecord } from './types';

const RESULT_TTL_MS = 5 * 60 * 1000;

const globalStore = globalThis as typeof globalThis & {
  __oauthResultStore?: Map<string, OAuthResultRecord>;
};

function getStore(): Map<string, OAuthResultRecord> {
  if (!globalStore.__oauthResultStore) {
    globalStore.__oauthResultStore = new Map();
  }
  return globalStore.__oauthResultStore;
}

function cleanupExpiredRecords(store: Map<string, OAuthResultRecord>) {
  const now = Date.now();
  for (const [token, record] of store.entries()) {
    if (now - record.createdAt > RESULT_TTL_MS) {
      store.delete(token);
    }
  }
}

export function createOAuthResultRecord(params: Omit<OAuthResultRecord, 'token' | 'createdAt'>) {
  const store = getStore();
  cleanupExpiredRecords(store);

  const record: OAuthResultRecord = {
    ...params,
    token: randomUUID(),
    createdAt: Date.now(),
  };

  store.set(record.token, record);
  return record;
}

export function consumeOAuthResult(token: string): OAuthResultRecord | null {
  if (!token) return null;

  const store = getStore();
  cleanupExpiredRecords(store);

  const record = store.get(token) || null;
  if (record) {
    store.delete(token);
  }

  return record;
}
