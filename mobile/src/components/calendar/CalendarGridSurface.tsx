import React, { useMemo } from 'react';
import { Platform, StyleSheet, ViewStyle } from 'react-native';
import {
  CalendarBody,
  CalendarBodyForMonthView,
  CalendarHeader,
  CalendarHeaderForMonthView,
  deepMerge,
  defaultTheme,
  getDatesInNextOneDay,
  getDatesInWeek,
  ThemeContext,
  ThemeInterface,
} from 'react-native-big-calendar';
import { colors } from '../../theme';
import {
  CalendarViewMode,
  CHORPY_CALENDAR_THEME,
  ChoreCalendarEvent,
  DAY_HEADER_HEIGHT_PX,
  DAY_HOUR_ROW_HEIGHT,
  MONTH_HEADER_HEIGHT_PX,
} from './calendarUtils';

export interface CalendarGridSurfaceProps {
  mode: CalendarViewMode;
  activeDate: Date;
  events: ChoreCalendarEvent[];
  height: number;
  scrollOffsetMinutes: number;
  isCellInteractive: boolean;
  eventCellStyle: (event: ChoreCalendarEvent) => ViewStyle[];
  onPressEvent: (event: ChoreCalendarEvent) => void;
  onPressCell: (date: Date) => void;
  onPressDateHeader?: (date: Date) => void;
}

const MERGED_CALENDAR_THEME: ThemeInterface = deepMerge<ThemeInterface>(
  defaultTheme,
  CHORPY_CALENDAR_THEME
);
const EMPTY_ALL_DAY_EVENTS: ChoreCalendarEvent[] = [];
const EMPTY_STYLE: ViewStyle = {};
const MONTH_MAX_VISIBLE_EVENTS = 3;
const MONTH_EVENT_MIN_HEIGHT = 22;

/**
 * Direct calendar surface built on react-native-big-calendar's exported header/body
 * primitives. Omitting `onSwipeHorizontal` prevents the library's internal PanResponder
 * from intercepting cell taps on Android/iOS, while explicit `zIndex: 0` + solid cell
 * background fixes Month negative-zIndex stacking and Android empty-View hit-testing.
 */
export const CalendarGridSurface = React.memo(function CalendarGridSurface({
  mode,
  activeDate,
  events,
  height,
  scrollOffsetMinutes,
  isCellInteractive,
  eventCellStyle,
  onPressEvent,
  onPressCell,
  onPressDateHeader,
}: CalendarGridSurfaceProps) {
  const targetDay = useMemo(() => getDatesInNextOneDay(activeDate, 'en')[0], [activeDate]);

  const dateRange = useMemo(() => {
    if (mode === 'week') {
      return getDatesInWeek(activeDate, 0, 'en');
    }
    return [targetDay];
  }, [activeDate, mode, targetDay]);

  const calendarCellStyle = useMemo<ViewStyle>(
    () => ({
      backgroundColor: colors.surface,
      zIndex: 0,
      ...(Platform.OS === 'web' && isCellInteractive ? { cursor: 'pointer' } : {}),
    }),
    [isCellInteractive]
  );

  const dayBodyStyle = useMemo<ViewStyle>(
    () => ({
      height: Math.max(240, height - DAY_HEADER_HEIGHT_PX),
    }),
    [height]
  );

  const monthBodyHeight = Math.max(300, height - MONTH_HEADER_HEIGHT_PX);

  return (
    <ThemeContext.Provider value={MERGED_CALENDAR_THEME}>
      {mode === 'month' ? (
        <>
          <CalendarHeaderForMonthView
            locale="en"
            weekStartsOn={0}
            style={styles.calendarHeader}
          />
          <CalendarBodyForMonthView<ChoreCalendarEvent>
            containerHeight={monthBodyHeight}
            targetDate={targetDay}
            events={events}
            style={styles.monthBody}
            eventCellStyle={eventCellStyle}
            calendarCellStyle={calendarCellStyle}
            showAdjacentMonths
            sortedMonthView
            weekStartsOn={0}
            maxVisibleEventCount={MONTH_MAX_VISIBLE_EVENTS}
            eventMinHeightForMonthView={MONTH_EVENT_MIN_HEIGHT}
            moreLabel="{moreCount} More"
            onPressEvent={onPressEvent}
            onPressCell={onPressCell}
            onLongPressCell={onPressCell}
          />
        </>
      ) : (
        <>
          <CalendarHeader<ChoreCalendarEvent>
            dateRange={dateRange}
            cellHeight={DAY_HOUR_ROW_HEIGHT}
            locale="en"
            style={styles.calendarHeader}
            allDayEventCellStyle={EMPTY_STYLE}
            allDayEventCellTextColor={colors.text}
            allDayEvents={EMPTY_ALL_DAY_EVENTS}
            showAllDayEventCell={false}
            activeDate={activeDate}
            onPressDateHeader={onPressDateHeader}
            onPressEvent={onPressEvent}
          />
          <CalendarBody<ChoreCalendarEvent>
            containerHeight={height}
            cellHeight={DAY_HOUR_ROW_HEIGHT}
            dateRange={dateRange}
            events={events}
            style={dayBodyStyle}
            scrollOffsetMinutes={scrollOffsetMinutes}
            ampm
            showTime
            eventCellStyle={eventCellStyle}
            eventCellTextColor={colors.text}
            calendarCellStyle={calendarCellStyle}
            onPressEvent={onPressEvent}
            onPressCell={onPressCell}
            onLongPressCell={onPressCell}
          />
        </>
      )}
    </ThemeContext.Provider>
  );
});

const styles = StyleSheet.create({
  calendarHeader: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  monthBody: {
    borderWidth: 0,
  },
});
