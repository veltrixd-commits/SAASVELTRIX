const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=facearea&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1546539782-6fc531453083?auto=format&fit=facearea&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=facearea&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?auto=format&fit=facearea&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1544723795-432537dc3d3d?auto=format&fit=facearea&w=256&h=256&q=80',
];

const NAMED_AVATARS: Record<string, string> = {
  'sarah johnson': DEFAULT_AVATARS[0],
  'michael chen': DEFAULT_AVATARS[1],
  'emily rodriguez': DEFAULT_AVATARS[2],
  'david kim': DEFAULT_AVATARS[3],
  'lisa anderson': DEFAULT_AVATARS[4],
  'marcus johnson': DEFAULT_AVATARS[5],
  'priya patel': DEFAULT_AVATARS[6],
  'alex robinson': DEFAULT_AVATARS[7],
};

const isLikelyUrl = (value?: string | null) => {
  if (!value) return false;
  const trimmed = value.trim();
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image') ||
    trimmed.startsWith('/')
  );
};

const hashSeed = (input: string) => {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};

const getAvatarByIndex = (index: number) => {
  const normalized = index % DEFAULT_AVATARS.length;
  return DEFAULT_AVATARS[normalized < 0 ? normalized + DEFAULT_AVATARS.length : normalized];
};

export function resolveProfilePhoto(source?: string | null, seed?: string | number | null) {
  if (isLikelyUrl(source)) {
    return source as string;
  }

  const normalizedSeed = String(seed || '').trim().toLowerCase();
  if (normalizedSeed && NAMED_AVATARS[normalizedSeed]) {
    return NAMED_AVATARS[normalizedSeed];
  }

  if (normalizedSeed) {
    return getAvatarByIndex(hashSeed(normalizedSeed));
  }

  return DEFAULT_AVATARS[0];
}
