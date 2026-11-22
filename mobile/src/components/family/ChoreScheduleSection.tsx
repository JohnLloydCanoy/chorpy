import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../theme';
import { ChoreLockMode } from '../../types';
import {
  applyLockPreset,
  getPresetOffsetMinutes,
  LOCK_PRESET_OPTIONS,
  LockPresetOption,
  normalizeToMinute,
} from '../../utils/choreScheduleUtils';
import { DateTimeFieldPicker, PickerTarget } from './DateTimeFieldPicker';

interface ChoreScheduleSectionProps {
  scheduledAt: Date;
  lockAt: Date;
  lockMode: ChoreLockMode;
  disabled?: boolean;
  error: string | null;
  onChangeSchedule: (scheduledAt: Date, lockAt: Date, lockMode: ChoreLockMode) => void;
}

interface LockPresetPillProps {
  option: LockPresetOption;
  isSelected: boolean;
  disabled: boolean;
  onSelect: (mode: ChoreLockMode) => void;
}

type ActivePicker = { field: 'scheduled' | 'lock'; target: Exclude<PickerTarget, null> } | null;

const LockPresetPill = React.memo(function LockPresetPill({
  option,
  isSelected,
  disabled,
  onSelect,
}: LockPresetPillProps) {
  const handlePress = useCallback(() => {
    onSelect(option.mode);
  }, [onSelect, option.mode]);

  const pillStyle = isSelected
    ? option.isUrgent
      ? styles.pillSelectedUrgent
      : styles.pillSelected
    : styles.pillInactive;

  const textStyle = isSelected
    ? option.isUrgent
      ? styles.pillTextUrgent
      : styles.pillTextSelected
    : styles.pillTextInactive;

  return (
    <TouchableOpacity
      style={[styles.pill, pillStyle, disabled && styles.pillDisabled]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected, disabled }}
      accessibilityLabel={option.accessibilityLabel}
    >
      <Text style={[styles.pillText, textStyle]} numberOfLines={1}>
        {option.label}
      </Text>
    </TouchableOpacity>
  );
});

export const ChoreScheduleSection = React.memo(function ChoreScheduleSection({
  scheduledAt,
  lockAt,
  lockMode,
  disabled = false,
  error,
  onChangeSchedule,
}: ChoreScheduleSectionProps) {
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);

  const handleScheduledTarget = useCallback((target: PickerTarget) => {
    setActivePicker(target ? { field: 'scheduled', target } : null);
  }, []);

  const handleLockTarget = useCallback((target: PickerTarget) => {
    setActivePicker(target ? { field: 'lock', target } : null);
  }, []);

  const handleSelectPreset = useCallback(
    (mode: ChoreLockMode) => {
      if (mode !== 'custom') setActivePicker(null);
      const next = applyLockPreset(mode, scheduledAt, lockAt);
      onChangeSchedule(next.scheduledAt, next.lockAt, next.lockMode);
    },
    [lockAt, onChangeSchedule, scheduledAt]
  );

  const handleScheduledChange = useCallback(
    (nextScheduled: Date) => {
      const normalized = normalizeToMinute(nextScheduled);
      const offsetMinutes = getPresetOffsetMinutes(lockMode);
      if (lockMode === 'immediate') {
        const nextLock = lockAt.getTime() < normalized.getTime() ? new Date(normalized.getTime()) : lockAt;
        onChangeSchedule(normalized, nextLock, 'custom');
        return;
      }
      if (offsetMinutes !== null) {
        const nextLock = new Date(normalized.getTime() + offsetMinutes * 60 * 1000);
        onChangeSchedule(normalized, nextLock, lockMode);
        return;
      }
      const nextLock = lockAt.getTime() < normalized.getTime() ? new Date(normalized.getTime()) : lockAt;
      onChangeSchedule(normalized, nextLock, 'custom');
    },
    [lockAt, lockMode, onChangeSchedule]
  );

  const handleLockChange = useCallback(
    (nextLock: Date) => {
      onChangeSchedule(scheduledAt, normalizeToMinute(nextLock), 'custom');
    },
    [onChangeSchedule, scheduledAt]
  );

  return (
    <View style={styles.section}>
      <DateTimeFieldPicker
        label="When to do"
        value={scheduledAt}
        activeTarget={activePicker?.field === 'scheduled' ? activePicker.target : null}
        disabled={disabled}
        onChangeTarget={handleScheduledTarget}
        onChangeValue={handleScheduledChange}
      />

      <Text style={styles.presetLabel}>Phone Lock Timing</Text>
      <View style={styles.presetGrid} accessibilityRole="radiogroup" accessibilityLabel="Phone lock timing presets">
        {LOCK_PRESET_OPTIONS.map((option) => (
          <LockPresetPill
            key={option.mode}
            option={option}
            isSelected={lockMode === option.mode}
            disabled={disabled}
            onSelect={handleSelectPreset}
          />
        ))}
      </View>

      <DateTimeFieldPicker
        label="Lock phone if not done by"
        value={lockAt}
        activeTarget={activePicker?.field === 'lock' ? activePicker.target : null}
        disabled={disabled}
        hasError={Boolean(error)}
        onChangeTarget={handleLockTarget}
        onChangeValue={handleLockChange}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  section: { marginTop: spacing.xs },
  presetLabel: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondaryMedium, color: colors.text, marginTop: spacing.sm, marginBottom: spacing.xs },
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  pill: { minHeight: 48, paddingHorizontal: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pillInactive: { backgroundColor: colors.background, borderColor: colors.border },
  pillSelected: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  pillSelectedUrgent: { backgroundColor: colors.dangerSoft, borderColor: colors.danger },
  pillDisabled: { opacity: 0.55 },
  pillText: { fontSize: typography.fontSizes.xs },
  pillTextInactive: { fontFamily: typography.fontFamily.secondaryMedium, color: colors.text },
  pillTextSelected: { fontFamily: typography.fontFamily.secondaryBold, color: colors.primary },
  pillTextUrgent: { fontFamily: typography.fontFamily.secondaryBold, color: colors.danger },
  errorText: { fontSize: typography.fontSizes.xs, fontFamily: typography.fontFamily.secondaryMedium, color: colors.danger, marginTop: spacing.xs },
});
