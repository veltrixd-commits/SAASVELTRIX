// Date filtering utilities for 7/30/90 day ranges

export type DateRange = '7' | '30' | '90' | 'all';

export const getDateRangeFilter = (range: DateRange) => {
  const now = new Date();
  const cutoffDate = new Date();
  
  switch (range) {
    case '7':
      cutoffDate.setDate(now.getDate() - 7);
      break;
    case '30':
      cutoffDate.setDate(now.getDate() - 30);
      break;
    case '90':
      cutoffDate.setDate(now.getDate() - 90);
      break;
    case 'all':
      return null; // No filter
    default:
      cutoffDate.setDate(now.getDate() - 7);
  }
  
  return cutoffDate;
};

export const filterByDateRange = <T extends { createdAt?: string; date?: string; timestamp?: string }>(
  items: T[],
  range: DateRange
): T[] => {
  if (range === 'all') return items;
  
  const cutoffDate = getDateRangeFilter(range);
  if (!cutoffDate) return items;
  
  return items.filter(item => {
    const itemDate = new Date(item.createdAt || item.date || item.timestamp || '');
    return itemDate >= cutoffDate;
  });
};

export const getDateRangeLabel = (range: DateRange): string => {
  switch (range) {
    case '7':
      return 'Last 7 Days';
    case '30':
      return 'Last 30 Days';
    case '90':
      return 'Last 90 Days';
    case 'all':
      return 'All Time';
    default:
      return 'Last 7 Days';
  }
};

export const getDateRangeOptions = () => [
  { value: '7' as DateRange, label: 'Last 7 Days' },
  { value: '30' as DateRange, label: 'Last 30 Days' },
  { value: '90' as DateRange, label: 'Last 90 Days' },
  { value: 'all' as DateRange, label: 'All Time' },
];

export const formatDateRange = (startDate: Date, endDate: Date): string => {
  return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
};

export const getWeekDates = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    weekDates.push(date);
  }
  
  return weekDates;
};

export const isToday = (date: Date | string): boolean => {
  const today = new Date();
  const compareDate = typeof date === 'string' ? new Date(date) : date;
  
  return today.toDateString() === compareDate.toDateString();
};

export const isYesterday = (date: Date | string): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const compareDate = typeof date === 'string' ? new Date(date) : date;
  
  return yesterday.toDateString() === compareDate.toDateString();
};

export const getRelativeTimeString = (date: Date | string): string => {
  const compareDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - compareDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return compareDate.toLocaleDateString();
};
