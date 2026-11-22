import React, { useCallback, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View, ViewStyle } from 'react-native';
import { borderRadius, colors, spacing } from '../../theme';
import { Chore, UserRole } from '../../types';
import { CalendarGridSurface } from './CalendarGridSurface';
import { CalendarToolbar } from './CalendarToolbar';
import {
  CalendarEmptyState, CalendarErrorState, CalendarLoadingSkeleton, CalendarStatusBanners,
} from './CalendarStateViews';
import {
  CalendarViewMode, ChoreCalendarEvent,
  DAY_HOUR_ROW_HEIGHT, DEFAULT_DAY_SCROLL_LEAD_MINUTES, DEFAULT_WEEK_SCROLL_MINUTES,
  getCurrentTimeScrollOffsetMinutes, getMaxCalendarScrollOffsetMinutes,
  mapChoresToCalendarEvents, shiftCalendarDate,
} from './calendarUtils';

interface ChoreCalendarViewProps {
  chores: Chore[];
  role: UserRole;
  loading: boolean;
  error: string | null;
  isPartial: boolean;
  mutationError: string | null;
  pendingIds: Record<string, boolean>;
  memberNameMap: Record<string, string>;
  hasHousehold: boolean;
  onRetry: () => void;
  onDismissMutationError: () => void;
  onOpenAddChore?: (initialScheduledAt?: Date) => void;
  onSelectChore?: (chore: Chore) => void;
}

const MIN_CALENDAR_HEIGHT = 420;

export const ChoreCalendarView = React.memo(function ChoreCalendarView({
  chores, role, loading, error, isPartial, mutationError,
  pendingIds, memberNameMap, hasHousehold, onRetry,
  onDismissMutationError, onOpenAddChore, onSelectChore,
}: ChoreCalendarViewProps) {
  const [mode, setMode] = useState<CalendarViewMode>('day');
  const [activeDate, setActiveDate] = useState<Date>(() => new Date());
  const [containerHeight, setContainerHeight] = useState<number>(MIN_CALENDAR_HEIGHT);
  const [isLayoutReady, setIsLayoutReady] = useState<boolean>(false);
  const [dayScrollOffsetMinutes, setDayScrollOffsetMinutes] = useState<number>(() =>
    getCurrentTimeScrollOffsetMinutes()
  );
  const [dayScrollNonce, setDayScrollNonce] = useState<number>(0);

  const triggerDayAutoScroll = useCallback((targetHeight: number) => {
    const maxOffset = getMaxCalendarScrollOffsetMinutes(targetHeight, DAY_HOUR_ROW_HEIGHT);
    setDayScrollOffsetMinutes(
      getCurrentTimeScrollOffsetMinutes(new Date(), DEFAULT_DAY_SCROLL_LEAD_MINUTES, maxOffset)
    );
    setDayScrollNonce((prev) => prev + 1);
  }, []);

  const events = useMemo(
    () => mapChoresToCalendarEvents(chores, memberNameMap, pendingIds),
    [chores, memberNameMap, pendingIds]
  );

  const handlePrev = useCallback(() => {
    setActiveDate((prev) => shiftCalendarDate(prev, mode, -1));
  }, [mode]);

  const handleNext = useCallback(() => {
    setActiveDate((prev) => shiftCalendarDate(prev, mode, 1));
  }, [mode]);

  const handleToday = useCallback(() => {
    setActiveDate(new Date());
    if (mode === 'day') {
      triggerDayAutoScroll(containerHeight);
    }
  }, [containerHeight, mode, triggerDayAutoScroll]);

  const handleSelectMode = useCallback(
    (nextMode: CalendarViewMode) => {
      setMode(nextMode);
      if (nextMode === 'day') {
        triggerDayAutoScroll(containerHeight);
      }
    },
    [containerHeight, triggerDayAutoScroll]
  );

  const handlePressEvent = useCallback(
    (event: ChoreCalendarEvent) => {
      if (event.isPendingSync || event.chore.id.startsWith('temp-')) return;
      onSelectChore?.(event.chore);
    },
    [onSelectChore]
  );

  const drillToDay = useCallback(
    (date: Date) => {
      setActiveDate(date);
      setMode('day');
      triggerDayAutoScroll(containerHeight);
    },
    [containerHeight, triggerDayAutoScroll]
  );

  const handleOpenEmptyAddChore = useCallback(() => {
    onOpenAddChore?.();
  }, [onOpenAddChore]);

  const handlePressCell = useCallback(
    (date: Date) => {
      if (mode === 'month') {
        drillToDay(date);
        return;
      }
      if (role === 'parent' && onOpenAddChore) {
        onOpenAddChore(date);
      }
    },
    [drillToDay, mode, onOpenAddChore, role]
  );

  const handleCalendarLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const measured = Math.floor(e.nativeEvent.layout.height);
      if (measured <= 0) return;
      const nextHeight = Math.max(MIN_CALENDAR_HEIGHT, measured);
      setContainerHeight((prev) => (prev === nextHeight ? prev : nextHeight));
      if (!isLayoutReady) {
        const maxOffset = getMaxCalendarScrollOffsetMinutes(nextHeight, DAY_HOUR_ROW_HEIGHT);
        setDayScrollOffsetMinutes(
          getCurrentTimeScrollOffsetMinutes(new Date(), DEFAULT_DAY_SCROLL_LEAD_MINUTES, maxOffset)
        );
        setIsLayoutReady(true);
      }
    },
    [isLayoutReady]
  );

  const getEventCellStyle = useCallback((event: ChoreCalendarEvent): ViewStyle[] => {
    if (event.isPendingSync) return [styles.eventBase, styles.eventSync];
    if (event.chore.status === 'approved') return [styles.eventBase, styles.eventApproved];
    if (event.chore.status === 'awaiting_approval') return [styles.eventBase, styles.eventReview];
    if (event.chore.status === 'rejected') return [styles.eventBase, styles.eventRejected];
    return [styles.eventBase, styles.eventPending];
  }, []);

  if (loading && chores.length === 0) {
    return <CalendarLoadingSkeleton />;
  }

  if (error && chores.length === 0) {
    return <CalendarErrorState error={error} onRetry={onRetry} />;
  }

  if (!loading && chores.length === 0) {
    return (
      <CalendarEmptyState
        role={role}
        hasHousehold={hasHousehold}
        mutationError={mutationError}
        onDismissMutationError={onDismissMutationError}
        onOpenAddChore={onOpenAddChore ? handleOpenEmptyAddChore : undefined}
      />
    );
  }

  const calendarKey = mode === 'day' ? `day-${dayScrollNonce}` : mode;
  const scrollOffsetMinutes =
    mode === 'day' ? dayScrollOffsetMinutes : DEFAULT_WEEK_SCROLL_MINUTES;

  return (
    <View style={styles.wrapper}>
      <CalendarStatusBanners
        isPartial={isPartial}
        error={error}
        mutationError={mutationError}
        onRetry={onRetry}
        onDismissMutationError={onDismissMutationError}
      />

      <CalendarToolbar
        mode={mode}
        activeDate={activeDate}
        onSelectMode={handleSelectMode}
        onPrev={handlePrev}
        onToday={handleToday}
        onNext={handleNext}
      />

      <View style={styles.calendarCard} onLayout={handleCalendarLayout}>
        {isLayoutReady ? (
          <CalendarGridSurface
            key={calendarKey}
            mode={mode}
            activeDate={activeDate}
            events={events}
            height={containerHeight}
            scrollOffsetMinutes={scrollOffsetMinutes}
            isCellInteractive={mode === 'month' || (role === 'parent' && Boolean(onOpenAddChore))}
            eventCellStyle={getEventCellStyle}
            onPressEvent={handlePressEvent}
            onPressCell={handlePressCell}
            onPressDateHeader={mode === 'week' ? drillToDay : undefined}
          />
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  calendarCard: { flex: 1, minHeight: MIN_CALENDAR_HEIGHT, backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  eventBase: { borderLeftWidth: 3, borderRadius: borderRadius.sm, paddingHorizontal: spacing.xs },
  eventPending: { backgroundColor: colors.warningSoft, borderLeftColor: colors.warning },
  eventReview: { backgroundColor: colors.secondarySoft, borderLeftColor: colors.secondaryDark },
  eventApproved: { backgroundColor: colors.successSoft, borderLeftColor: colors.success },
  eventRejected: { backgroundColor: colors.dangerSoft, borderLeftColor: colors.danger },
  eventSync: { backgroundColor: colors.primarySoft, borderLeftColor: colors.primary },
});
