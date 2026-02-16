import { randomUUID } from 'crypto';
import type { OAuthStateRecord } from './types';

const STATE_TTL_MS = 10 * 60 * 1000;

const globalStore = globalThis as typeof globalThis & {
  __oauthStateStore?: Map<string, OAuthStateRecord>;
};

function getStore(): Map<string, OAuthStateRecord> {
  if (!globalStore.__oauthStateStore) {
    globalStore.__oauthStateStore = new Map();
  }
  return globalStore.__oauthStateStore;
}

function cleanupExpiredRecords(store: Map<string, OAuthStateRecord>) {
  const now = Date.now();
  for (const [state, record] of store.entries()) {
    if (now - record.createdAt > STATE_TTL_MS) {
      store.delete(state);
    }
  }
}

export function createOAuthStateRecord(params: Omit<OAuthStateRecord, 'state' | 'createdAt'>) {
  const store = getStore();
  cleanupExpiredRecords(store);

  const record: OAuthStateRecord = {
    ...params,
    state: randomUUID(),
    createdAt: Date.now(),
  };

  store.set(record.state, record);
  return record;
}

export function consumeOAuthState(state: string): OAuthStateRecord | null {
  if (!state) return null;

  const store = getStore();
  cleanupExpiredRecords(store);

  const record = store.get(state) || null;
  if (record) {
    store.delete(state);
  }

  return record;
}
