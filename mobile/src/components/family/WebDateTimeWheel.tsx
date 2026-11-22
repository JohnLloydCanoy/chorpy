import React, { useCallback, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../theme';
import { WheelColumn, WheelItem } from '../onboarding/WheelColumn';

export interface WebDateTimeWheelProps {
  mode: 'date' | 'time';
  value: Date;
  onChange: (next: Date) => void;
  onDone: () => void;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;
const HOUR_ITEMS: readonly WheelItem[] = Array.from({ length: 12 }, (_, idx) => ({
  label: String(idx + 1).padStart(2, '0'),
  value: idx + 1,
}));
const MINUTE_ITEMS: readonly WheelItem[] = Array.from({ length: 60 }, (_, idx) => ({
  label: String(idx).padStart(2, '0'),
  value: idx,
}));
const MERIDIEM_ITEMS: readonly WheelItem[] = [
  { label: 'AM', value: 0 },
  { label: 'PM', value: 1 },
];

function buildClampedDate(base: Date, year: number, month: number, day: number): Date {
  const daysInMonth = new Date(year, month, 0).getDate();
  const safeDay = Math.max(1, Math.min(daysInMonth, day));
  const next = new Date(base.getTime());
  next.setFullYear(year, month - 1, safeDay);
  next.setSeconds(0, 0);
  return next;
}

function buildTimeDate(base: Date, hour12: number, minute: number, isPm: boolean): Date {
  const hour24 = (hour12 % 12) + (isPm ? 12 : 0);
  const next = new Date(base.getTime());
  next.setHours(hour24, minute, 0, 0);
  return next;
}

export const WebDateTimeWheel = React.memo(function WebDateTimeWheel({
  mode,
  value,
  onChange,
  onDone,
}: WebDateTimeWheelProps) {
  const currentYear = new Date().getFullYear();
  const selectedYear = value.getFullYear();
  const selectedMonth = value.getMonth() + 1;
  const selectedDay = value.getDate();

  const yearItems = useMemo<WheelItem[]>(() => {
    const startYear = Math.min(currentYear, selectedYear);
    const endYear = Math.max(currentYear + 2, selectedYear);
    const list: WheelItem[] = [];
    for (let y = startYear; y <= endYear; y++) list.push({ label: String(y), value: y });
    return list;
  }, [currentYear, selectedYear]);

  const monthItems = useMemo<WheelItem[]>(
    () => MONTH_NAMES.map((label, idx) => ({ label, value: idx + 1 })),
    []
  );

  const dayItems = useMemo<WheelItem[]>(() => {
    const count = new Date(selectedYear, selectedMonth, 0).getDate();
    return Array.from({ length: count }, (_, idx) => ({
      label: String(idx + 1).padStart(2, '0'),
      value: idx + 1,
    }));
  }, [selectedYear, selectedMonth]);

  const rawHour = value.getHours();
  const selectedMeridiem = rawHour >= 12 ? 1 : 0;
  const selectedHour12 = rawHour % 12 === 0 ? 12 : rawHour % 12;
  const selectedMinute = value.getMinutes();

  const handleSetToday = useCallback(() => {
    const now = new Date();
    onChange(buildClampedDate(value, now.getFullYear(), now.getMonth() + 1, now.getDate()));
  }, [onChange, value]);

  const handleSetTomorrow = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    onChange(buildClampedDate(value, tomorrow.getFullYear(), tomorrow.getMonth() + 1, tomorrow.getDate()));
  }, [onChange, value]);

  const handleSelectMonth = useCallback(
    (m: number) => onChange(buildClampedDate(value, selectedYear, m, selectedDay)),
    [onChange, selectedDay, selectedYear, value]
  );

  const handleSelectDay = useCallback(
    (d: number) => onChange(buildClampedDate(value, selectedYear, selectedMonth, d)),
    [onChange, selectedMonth, selectedYear, value]
  );

  const handleSelectYear = useCallback(
    (y: number) => onChange(buildClampedDate(value, y, selectedMonth, selectedDay)),
    [onChange, selectedDay, selectedMonth, value]
  );

  const handleSelectHour = useCallback(
    (h12: number) => onChange(buildTimeDate(value, h12, selectedMinute, selectedMeridiem === 1)),
    [onChange, selectedMeridiem, selectedMinute, value]
  );

  const handleSelectMinute = useCallback(
    (min: number) => onChange(buildTimeDate(value, selectedHour12, min, selectedMeridiem === 1)),
    [onChange, selectedHour12, selectedMeridiem, value]
  );

  const handleSelectMeridiem = useCallback(
    (mer: number) => onChange(buildTimeDate(value, selectedHour12, selectedMinute, mer === 1)),
    [onChange, selectedHour12, selectedMinute, value]
  );

  return (
    <View style={styles.panel}>
      {mode === 'date' ? (
        <>
          <View style={styles.quickDayRow}>
            <TouchableOpacity style={styles.quickDayBtn} onPress={handleSetToday} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Select today">
              <Text style={styles.quickDayText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickDayBtn} onPress={handleSetTomorrow} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Select tomorrow">
              <Text style={styles.quickDayText}>Tomorrow</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.wheelRow}>
            <WheelColumn items={monthItems} selectedValue={selectedMonth} onSelect={handleSelectMonth} accessibilityLabel="Select month" />
            <WheelColumn items={dayItems} selectedValue={selectedDay} onSelect={handleSelectDay} accessibilityLabel="Select day" />
            <WheelColumn items={yearItems} selectedValue={selectedYear} onSelect={handleSelectYear} accessibilityLabel="Select year" />
          </View>
        </>
      ) : (
        <View style={styles.wheelRow}>
          <WheelColumn items={HOUR_ITEMS} selectedValue={selectedHour12} onSelect={handleSelectHour} accessibilityLabel="Select hour" />
          <WheelColumn items={MINUTE_ITEMS} selectedValue={selectedMinute} onSelect={handleSelectMinute} accessibilityLabel="Select minute" />
          <WheelColumn items={MERIDIEM_ITEMS} selectedValue={selectedMeridiem} onSelect={handleSelectMeridiem} accessibilityLabel="Select AM or PM" />
        </View>
      )}

      <TouchableOpacity style={styles.doneBtn} onPress={onDone} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Confirm selected date or time">
        <Text style={styles.doneText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  panel: { backgroundColor: colors.surface, overflow: 'hidden' },
  quickDayRow: { flexDirection: 'row', gap: spacing.xs, padding: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.background },
  quickDayBtn: { flex: 1, minHeight: 48, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  quickDayText: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: typography.fontSizes.xs, color: colors.primary },
  wheelRow: { flexDirection: 'row', paddingHorizontal: spacing.xs, paddingVertical: spacing.xs, gap: spacing.xs },
  doneBtn: { minHeight: 48, backgroundColor: colors.primarySoft, borderTopWidth: 1, borderTopColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  doneText: { fontFamily: typography.fontFamily.secondaryBold, fontSize: typography.fontSizes.sm, color: colors.primary },
});
