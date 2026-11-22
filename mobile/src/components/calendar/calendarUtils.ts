import { ICalendarEventBase, PartialTheme } from 'react-native-big-calendar';
import { Chore, ChoreStatus } from '../../types';
import { colors, typography } from '../../theme';

export type CalendarViewMode = 'day' | 'week' | 'month';

export interface ChoreCalendarEvent extends ICalendarEventBase {
  id: string;
  chore: Chore;
  assignedLabel: string;
  isPendingSync: boolean;
}

export const CHORE_STATUS_LABELS: Record<ChoreStatus, string> = {
  pending: 'Pending',
  awaiting_approval: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

const DEFAULT_EVENT_DURATION_MS = 60 * 60 * 1000;
const MIN_EVENT_DURATION_MS = 30 * 60 * 1000;
const MAX_EVENT_DURATION_MS = 4 * 60 * 60 * 1000;
const MINUTES_PER_DAY = 24 * 60;

export const DAY_HOUR_ROW_HEIGHT = 60;
export const DAY_HEADER_HEIGHT_PX = DAY_HOUR_ROW_HEIGHT + 8;
export const MONTH_HEADER_HEIGHT_PX = 34;
export const DEFAULT_DAY_SCROLL_LEAD_MINUTES = 120;
export const DEFAULT_WEEK_SCROLL_MINUTES = 420;

export const CHORPY_CALENDAR_THEME: PartialTheme = {
  palette: {
    primary: {
      main: colors.primary,
      contrastText: colors.textLight,
    },
    nowIndicator: colors.secondaryDark,
    moreLabel: colors.primary,
    gray: {
      100: colors.background,
      200: colors.border,
      300: colors.border,
      500: colors.textSecondary,
      800: colors.text,
    },
  },
  typography: {
    fontFamily: typography.fontFamily.secondary,
    xs: {
      fontFamily: typography.fontFamily.secondaryMedium,
      fontSize: typography.fontSizes.xs,
    },
    sm: {
      fontFamily: typography.fontFamily.secondaryMedium,
      fontSize: typography.fontSizes.xs,
    },
    xl: {
      fontFamily: typography.fontFamily.mainSemiBold,
      fontSize: typography.fontSizes.lg,
    },
    moreLabel: {
      fontFamily: typography.fontFamily.secondaryBold,
      fontSize: typography.fontSizes.xs,
    },
  },
};

export function mapChoresToCalendarEvents(
  chores: Chore[],
  memberNameMap: Record<string, string>,
  pendingIds: Record<string, boolean>
): ChoreCalendarEvent[] {
  return chores.map((chore) => {
    const scheduledCandidate = new Date(chore.scheduled_at || chore.created_at);
    const createdCandidate = new Date(chore.created_at);
    const start = !Number.isNaN(scheduledCandidate.getTime())
      ? scheduledCandidate
      : !Number.isNaN(createdCandidate.getTime())
      ? createdCandidate
      : new Date();

    const lockCandidate = new Date(chore.lock_at || '');
    const rawDuration = !Number.isNaN(lockCandidate.getTime())
      ? lockCandidate.getTime() - start.getTime()
      : DEFAULT_EVENT_DURATION_MS;
    const clampedDuration = Math.max(
      MIN_EVENT_DURATION_MS,
      Math.min(MAX_EVENT_DURATION_MS, rawDuration > 0 ? rawDuration : DEFAULT_EVENT_DURATION_MS)
    );
    const end = new Date(start.getTime() + clampedDuration);

    return {
      id: chore.id,
      title: chore.title,
      start,
      end,
      chore,
      assignedLabel: memberNameMap[chore.assigned_child_id] || 'Assigned Child',
      isPendingSync: Boolean(pendingIds[chore.id]),
    };
  });
}

export function shiftCalendarDate(
  baseDate: Date,
  mode: CalendarViewMode,
  direction: -1 | 1
): Date {
  const next = new Date(baseDate.getTime());
  if (mode === 'day') {
    next.setDate(next.getDate() + direction);
    return next;
  }
  if (mode === 'week') {
    next.setDate(next.getDate() + direction * 7);
    return next;
  }

  const targetMonth = next.getMonth() + direction;
  const originalDay = next.getDate();
  next.setDate(1);
  next.setMonth(targetMonth);
  const daysInTargetMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(originalDay, daysInTargetMonth));
  return next;
}

export function formatCalendarRangeLabel(date: Date, mode: CalendarViewMode): string {
  if (mode === 'month') {
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
  }
  if (mode === 'day') {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  }

  const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
  const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6);
  const startLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(weekStart);
  const endLabel = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(weekEnd);
  return `${startLabel} - ${endLabel}`;
}

export function formatEventDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function getMaxCalendarScrollOffsetMinutes(
  containerHeight: number,
  hourRowHeight: number = DAY_HOUR_ROW_HEIGHT
): number {
  if (hourRowHeight <= 0) {
    return MINUTES_PER_DAY;
  }
  const scrollViewportHeight = Math.max(
    0,
    containerHeight - DAY_HEADER_HEIGHT_PX
  );
  const visibleMinutes = Math.floor((scrollViewportHeight / hourRowHeight) * 60);
  return Math.max(0, MINUTES_PER_DAY - visibleMinutes);
}

export function getCurrentTimeScrollOffsetMinutes(
  now: Date = new Date(),
  leadMinutes: number = DEFAULT_DAY_SCROLL_LEAD_MINUTES,
  maxOffsetMinutes?: number
): number {
  const safeNow = Number.isNaN(now.getTime()) ? new Date() : now;
  const safeLead = Math.max(0, Math.floor(leadMinutes));
  const currentMinutes = safeNow.getHours() * 60 + safeNow.getMinutes();
  const rawTarget = Math.max(0, currentMinutes - safeLead);
  const upperBound =
    maxOffsetMinutes === undefined
      ? Math.max(0, MINUTES_PER_DAY - safeLead)
      : Math.max(0, Math.min(MINUTES_PER_DAY, Math.floor(maxOffsetMinutes)));
  return Math.min(upperBound, rawTarget);
}
