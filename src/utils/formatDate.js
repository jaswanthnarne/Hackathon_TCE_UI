import { format, formatDistanceToNow, parseISO } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '—';
  try { return format(typeof date === 'string' ? parseISO(date) : date, 'MMM dd, yyyy'); } catch { return '—'; }
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  try { return format(typeof date === 'string' ? parseISO(date) : date, 'MMM dd, yyyy HH:mm'); } catch { return '—'; }
};

export const formatTimeAgo = (date) => {
  if (!date) return '—';
  try { return formatDistanceToNow(typeof date === 'string' ? parseISO(date) : date, { addSuffix: true }); } catch { return '—'; }
};
