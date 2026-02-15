import clsx from 'clsx';
import { resolveProfilePhoto } from '@/lib/profileMedia';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_MAP: Record<AvatarSize, string> = {
  xs: 'h-8 w-8',
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-20 w-20',
};

interface AvatarImageProps {
  name?: string;
  email?: string;
  src?: string | null;
  size?: AvatarSize;
  className?: string;
  rounded?: 'full' | 'xl';
  showBorder?: boolean;
}

export function AvatarImage({
  name,
  email,
  src,
  size = 'md',
  className,
  rounded = 'full',
  showBorder = true,
}: AvatarImageProps) {
  const resolved = resolveProfilePhoto(src, email || name);
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <img
      src={resolved}
      alt={name ? `${name} avatar` : 'Team member avatar'}
      className={clsx(
        'object-cover shadow-sm',
        rounded === 'xl' ? 'rounded-2xl' : 'rounded-full',
        showBorder ? 'border border-white/70 dark:border-white/20' : 'border-0',
        sizeClass,
        className,
      )}
      loading="lazy"
      draggable={false}
    />
  );
}
