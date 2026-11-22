import { Chore, UserRole } from '../types';
import { formatCompactChoreTiming, formatScheduleTimeLabel } from './choreScheduleUtils';

export interface ChoreNotificationItem {
  id: string;
  choreId: string;
  chore: Chore;
  categoryLabel: string;
  title: string;
  detailText: string;
  timeLabel: string;
  timestampMs: number;
  isUrgent: boolean;
  isUnread: boolean;
  isPendingSync: boolean;
}

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatRelativeTime(date: Date, now: Date = new Date()): string {
  const safe = Number.isNaN(date.getTime()) ? now : date;
  const diffMs = now.getTime() - safe.getTime();

  if (diffMs < MINUTE_MS) return 'Just now';
  if (diffMs < HOUR_MS) return `${Math.floor(diffMs / MINUTE_MS)}m ago`;
  if (diffMs < DAY_MS && isSameCalendarDay(safe, now)) {
    return `${Math.floor(diffMs / HOUR_MS)}h ago`;
  }

  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (isSameCalendarDay(safe, yesterday)) return 'Yesterday';

  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(safe);
}

export function formatNotificationTimestamp(date: Date, now: Date = new Date()): string {
  const safe = Number.isNaN(date.getTime()) ? now : date;
  const relative = formatRelativeTime(safe, now);
  const clock = formatScheduleTimeLabel(safe);
  return `${relative} · ${clock}`;
}

/**
 * Maps household chores into Facebook-style notification entries.
 * - Parents & Co-Parents see "Created Chore" entries with creation time.
 * - Children see "Task Assigned" entries with timing and creation time.
 */
export function buildChoreNotifications(
  chores: Chore[],
  role: UserRole,
  memberNameMap: Record<string, string>,
  lastSeenAt: number,
  readIds: Record<string, boolean>,
  pendingIds: Record<string, boolean>,
  nowMs: number = Date.now()
): ChoreNotificationItem[] {
  const nowDate = new Date(nowMs);
  const sorted = [...chores].sort((a, b) => {
    const aMs = Date.parse(a.created_at || a.scheduled_at);
    const bMs = Date.parse(b.created_at || b.scheduled_at);
    return (Number.isNaN(bMs) ? 0 : bMs) - (Number.isNaN(aMs) ? 0 : aMs);
  });

  return sorted.map((chore) => {
    const createdDate = new Date(chore.created_at || chore.scheduled_at);
    const parsedMs = createdDate.getTime();
    const timestampMs = Number.isNaN(parsedMs) ? nowMs : parsedMs;
    const assignedName = memberNameMap[chore.assigned_child_id] || 'Assigned Child';
    const isParent = role === 'parent';
    const isUrgent = chore.lock_mode === 'immediate' && chore.status !== 'approved';
    const isUnread = timestampMs > lastSeenAt && !readIds[chore.id];

    return {
      id: `notif-${chore.id}`,
      choreId: chore.id,
      chore,
      categoryLabel: isParent ? 'Created Chore' : 'Task Assigned',
      title: chore.title,
      detailText: isParent ? `Assigned to ${assignedName}` : formatCompactChoreTiming(chore),
      timeLabel: formatNotificationTimestamp(createdDate, nowDate),
      timestampMs,
      isUrgent,
      isUnread,
      isPendingSync: Boolean(pendingIds[chore.id]) || chore.id.startsWith('temp-'),
    };
  });
}
