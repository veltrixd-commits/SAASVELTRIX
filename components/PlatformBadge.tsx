import clsx from 'clsx';
import {
  siTiktok,
  siWhatsapp,
  siInstagram,
  siFacebook,
  siGmail,
  siYoutube,
  siSnapchat,
  siTelegram,
  siMessenger,
  siX,
  siGoogle,
  type SimpleIcon,
} from 'simple-icons';

const PLATFORM_MAP: Record<string, { icon: SimpleIcon; label: string }> = {
  TIKTOK: { icon: siTiktok, label: 'TikTok' },
  WHATSAPP: { icon: siWhatsapp, label: 'WhatsApp' },
  INSTAGRAM: { icon: siInstagram, label: 'Instagram' },
  FACEBOOK: { icon: siFacebook, label: 'Facebook' },
  LINKEDIN: { icon: siGoogle, label: 'LinkedIn' }, // Fallback to Google icon
  EMAIL: { icon: siGmail, label: 'Email' },
  GMAIL: { icon: siGmail, label: 'Gmail' },
  GOOGLE_MY_BUSINESS: { icon: siGoogle, label: 'Google Business' },
  YOUTUBE: { icon: siYoutube, label: 'YouTube' },
  SNAPCHAT: { icon: siSnapchat, label: 'Snapchat' },
  TELEGRAM: { icon: siTelegram, label: 'Telegram' },
  MESSENGER: { icon: siMessenger, label: 'Messenger' },
  FACEBOOK_MESSENGER: { icon: siMessenger, label: 'Messenger' },
  TWITTER: { icon: siX, label: 'Twitter' },
  X: { icon: siX, label: 'X' },
  SLACK: { icon: siGoogle, label: 'Slack' }, // Fallback to Google icon
  DEFAULT: { icon: siGoogle, label: 'Social' },
};

const SIZE_STYLES = {
  xs: {
    wrapper: 'px-2 py-0.5 text-[11px] gap-1',
    icon: 'h-4 w-4',
    iconOnly: 'h-6 w-6',
  },
  sm: {
    wrapper: 'px-2.5 py-1 text-xs gap-1.5',
    icon: 'h-4 w-4',
    iconOnly: 'h-7 w-7',
  },
  md: {
    wrapper: 'px-3 py-1.5 text-sm gap-2',
    icon: 'h-5 w-5',
    iconOnly: 'h-8 w-8',
  },
  lg: {
    wrapper: 'px-3.5 py-2 text-base gap-2.5',
    icon: 'h-6 w-6',
    iconOnly: 'h-10 w-10',
  },
} as const;

export type PlatformBadgeSize = keyof typeof SIZE_STYLES;
export type PlatformBadgeVariant = 'pill' | 'icon';

interface PlatformBadgeProps {
  platform: string;
  label?: string;
  showLabel?: boolean;
  size?: PlatformBadgeSize;
  variant?: PlatformBadgeVariant;
  className?: string;
  iconClassName?: string;
}

const normalizePlatform = (value: string) => {
  return value?.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_') || 'DEFAULT';
};

export function PlatformBadge({
  platform,
  label,
  showLabel = true,
  size = 'md',
  variant = 'pill',
  className,
  iconClassName,
}: PlatformBadgeProps) {
  const normalized = normalizePlatform(platform);
  const meta = PLATFORM_MAP[normalized] || PLATFORM_MAP.DEFAULT;
  const { wrapper, icon, iconOnly } = SIZE_STYLES[size] || SIZE_STYLES.md;

  const iconNode = (
    <span
      className={clsx(
        'inline-flex items-center justify-center rounded-full text-white shadow-md ring-1 ring-black/10',
        variant === 'icon' ? iconOnly : icon,
        iconClassName,
      )}
      style={{ backgroundColor: `#${meta.icon.hex}` }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="h-3/4 w-3/4" role="presentation">
        <path d={meta.icon.path} fill="currentColor" />
      </svg>
    </span>
  );

  if (variant === 'icon') {
    return (
      <span className={clsx('inline-flex items-center justify-center', className)} title={label || meta.label}>
        {iconNode}
      </span>
    );
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white font-medium',
        wrapper,
        className,
      )}
    >
      {iconNode}
      {showLabel && <span className="truncate">{label || meta.label}</span>}
    </span>
  );
}
