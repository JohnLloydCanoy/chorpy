import React, { useCallback, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../theme';
import { CalendarViewMode, formatCalendarRangeLabel } from './calendarUtils';

interface CalendarToolbarProps {
  mode: CalendarViewMode;
  activeDate: Date;
  onSelectMode: (mode: CalendarViewMode) => void;
  onPrev: () => void;
  onToday: () => void;
  onNext: () => void;
}

interface ModeButtonProps {
  id: CalendarViewMode;
  label: string;
  isActive: boolean;
  onSelect: (mode: CalendarViewMode) => void;
}

const MODE_OPTIONS: readonly { id: CalendarViewMode; label: string }[] = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
];

const ModeButton = React.memo(function ModeButton({
  id,
  label,
  isActive,
  onSelect,
}: ModeButtonProps) {
  const handlePress = useCallback(() => {
    onSelect(id);
  }, [id, onSelect]);

  return (
    <TouchableOpacity
      style={[styles.modeButton, isActive ? styles.modeButtonActive : styles.modeButtonInactive]}
      onPress={handlePress}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={`${label} calendar view`}
      activeOpacity={0.8}
    >
      <Text
        style={[styles.modeLabel, isActive ? styles.modeLabelActive : styles.modeLabelInactive]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
});

export const CalendarToolbar = React.memo(function CalendarToolbar({
  mode,
  activeDate,
  onSelectMode,
  onPrev,
  onToday,
  onNext,
}: CalendarToolbarProps) {
  const rangeLabel = useMemo(
    () => formatCalendarRangeLabel(activeDate, mode),
    [activeDate, mode]
  );

  return (
    <View style={styles.toolbar}>
      <View style={styles.navRow}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={onPrev}
          accessibilityRole="button"
          accessibilityLabel={`Previous ${mode}`}
          activeOpacity={0.8}
        >
          <Text style={styles.navButtonText}>Prev</Text>
        </TouchableOpacity>

        <View style={styles.rangeCenter}>
          <Text style={styles.rangeTitle} numberOfLines={1}>
            {rangeLabel}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.todayButton}
          onPress={onToday}
          accessibilityRole="button"
          accessibilityLabel="Jump to today"
          activeOpacity={0.8}
        >
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={onNext}
          accessibilityRole="button"
          accessibilityLabel={`Next ${mode}`}
          activeOpacity={0.8}
        >
          <Text style={styles.navButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.modeRow} accessibilityRole="tablist">
        {MODE_OPTIONS.map((option) => (
          <ModeButton
            key={option.id}
            id={option.id}
            label={option.label}
            isActive={mode === option.id}
            onSelect={onSelectMode}
          />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  toolbar: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  navButton: {
    minHeight: 48,
    minWidth: 52,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontFamily: typography.fontFamily.secondarySemiBold,
    fontSize: typography.fontSizes.xs,
    color: colors.primary,
  },
  rangeCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  rangeTitle: {
    fontFamily: typography.fontFamily.mainSemiBold,
    fontSize: typography.fontSizes.base,
    color: colors.primary,
    textAlign: 'center',
  },
  todayButton: {
    minHeight: 48,
    minWidth: 56,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayButtonText: {
    fontFamily: typography.fontFamily.secondaryBold,
    fontSize: typography.fontSizes.xs,
    color: colors.primary,
  },
  modeRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  modeButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
  },
  modeButtonInactive: {
    backgroundColor: colors.surface,
  },
  modeLabel: {
    fontSize: typography.fontSizes.sm,
  },
  modeLabelActive: {
    color: colors.textLight,
    fontFamily: typography.fontFamily.secondaryBold,
  },
  modeLabelInactive: {
    color: colors.primary,
    fontFamily: typography.fontFamily.secondaryMedium,
  },
});
