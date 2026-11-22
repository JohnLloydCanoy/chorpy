import { Chore, ChoreLockMode } from '../types';

export interface LockPresetOption {
  mode: ChoreLockMode;
  label: string;
  offsetMinutes: number | null;
  isUrgent: boolean;
  accessibilityLabel: string;
}

export interface ChoreScheduleState {
  scheduledAt: Date;
  lockAt: Date;
  lockMode: ChoreLockMode;
}

export const LOCK_PRESET_OPTIONS: readonly LockPresetOption[] = [
  { mode: 'immediate', label: 'Right Now', offsetMinutes: 0, isUrgent: true, accessibilityLabel: 'Lock phone right away' },
  { mode: 'offset_30m', label: '30 mins', offsetMinutes: 30, isUrgent: false, accessibilityLabel: 'Lock phone 30 minutes from schedule time' },
  { mode: 'offset_1h', label: '1 hr', offsetMinutes: 60, isUrgent: false, accessibilityLabel: 'Lock phone 1 hour from schedule time' },
  { mode: 'offset_2h', label: '2 hrs', offsetMinutes: 120, isUrgent: false, accessibilityLabel: 'Lock phone 2 hours from schedule time' },
  { mode: 'custom', label: 'Custom', offsetMinutes: null, isUrgent: false, accessibilityLabel: 'Choose a custom phone lock time' },
];

const MINUTE_MS = 60 * 1000;

export function normalizeToMinute(date: Date): Date {
  const safe = Number.isNaN(date.getTime()) ? new Date() : new Date(date.getTime());
  safe.setSeconds(0, 0);
  return safe;
}

export function getPresetOffsetMinutes(mode: ChoreLockMode): number | null {
  const found = LOCK_PRESET_OPTIONS.find((opt) => opt.mode === mode);
  return found ? found.offsetMinutes : null;
}

export function createDefaultChoreSchedule(now: Date = new Date()): ChoreScheduleState {
  const base = normalizeToMinute(now);
  return {
    scheduledAt: base,
    lockAt: new Date(base.getTime() + 30 * MINUTE_MS),
    lockMode: 'offset_30m',
  };
}

export function createScheduleFromChore(chore: Chore): ChoreScheduleState {
  const scheduledRaw = new Date(chore.scheduled_at || chore.created_at);
  const scheduledAt = normalizeToMinute(
    Number.isNaN(scheduledRaw.getTime()) ? new Date() : scheduledRaw
  );
  const lockRaw = new Date(chore.lock_at || chore.scheduled_at || chore.created_at);
  const rawLock = normalizeToMinute(Number.isNaN(lockRaw.getTime()) ? scheduledAt : lockRaw);
  const lockAt = rawLock.getTime() < scheduledAt.getTime() ? new Date(scheduledAt.getTime()) : rawLock;
  const validModes: readonly ChoreLockMode[] = [
    'immediate', 'offset_30m', 'offset_1h', 'offset_2h', 'custom',
  ];
  const lockMode: ChoreLockMode = validModes.includes(chore.lock_mode) ? chore.lock_mode : 'custom';
  return { scheduledAt, lockAt, lockMode };
}

export function applyLockPreset(
  mode: ChoreLockMode,
  currentScheduledAt: Date,
  currentLockAt: Date,
  now: Date = new Date()
): ChoreScheduleState {
  if (mode === 'immediate') {
    const snappedNow = normalizeToMinute(now);
    return { scheduledAt: snappedNow, lockAt: new Date(snappedNow.getTime()), lockMode: 'immediate' };
  }

  const offsetMinutes = getPresetOffsetMinutes(mode);
  if (offsetMinutes !== null) {
    const baseScheduled = normalizeToMinute(currentScheduledAt);
    return {
      scheduledAt: baseScheduled,
      lockAt: new Date(baseScheduled.getTime() + offsetMinutes * MINUTE_MS),
      lockMode: mode,
    };
  }

  const safeScheduled = normalizeToMinute(currentScheduledAt);
  const safeLock = normalizeToMinute(currentLockAt);
  const adjustedLock = safeLock.getTime() < safeScheduled.getTime() ? new Date(safeScheduled.getTime()) : safeLock;
  return { scheduledAt: safeScheduled, lockAt: adjustedLock, lockMode: 'custom' };
}

export function mergeDatePart(base: Date, pickedDate: Date): Date {
  const next = normalizeToMinute(base);
  next.setFullYear(pickedDate.getFullYear(), pickedDate.getMonth(), pickedDate.getDate());
  return next;
}

export function mergeTimePart(base: Date, pickedTime: Date): Date {
  const next = normalizeToMinute(base);
  next.setHours(pickedTime.getHours(), pickedTime.getMinutes(), 0, 0);
  return next;
}

export function validateChoreSchedule(
  scheduledAt: Date,
  lockAt: Date,
  lockMode: ChoreLockMode
): string | null {
  if (Number.isNaN(scheduledAt.getTime())) {
    return 'Please choose a valid date and time to do this chore.';
  }
  if (Number.isNaN(lockAt.getTime())) {
    return 'Please choose a valid phone lock time.';
  }
  if (lockMode !== 'immediate' && lockAt.getTime() < scheduledAt.getTime()) {
    return 'Phone lock time must be at or after the scheduled chore time.';
  }
  return null;
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function formatScheduleDateLabel(date: Date, now: Date = new Date()): string {
  const safe = Number.isNaN(date.getTime()) ? now : date;
  const shortMonthDay = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(safe);
  if (isSameCalendarDay(safe, now)) return `Today, ${shortMonthDay}`;

  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  if (isSameCalendarDay(safe, tomorrow)) return `Tomorrow, ${shortMonthDay}`;

  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(safe);
}

export function formatScheduleTimeLabel(date: Date): string {
  const safe = Number.isNaN(date.getTime()) ? new Date() : date;
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(safe);
}

export function formatCompactChoreTiming(chore: Chore): string {
  const scheduled = new Date(chore.scheduled_at || chore.created_at);
  const lockDate = new Date(chore.lock_at || chore.scheduled_at || chore.created_at);
  if (chore.lock_mode === 'immediate') {
    return 'Locks right away';
  }
  const doTime = formatScheduleTimeLabel(scheduled);
  const lockTime = isSameCalendarDay(scheduled, lockDate)
    ? formatScheduleTimeLabel(lockDate)
    : `${formatScheduleDateLabel(lockDate)} ${formatScheduleTimeLabel(lockDate)}`;
  return `Do ${doTime} | Locks ${lockTime}`;
}
