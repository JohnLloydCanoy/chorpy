import React, { useMemo, useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { WheelColumn, WheelItem } from './WheelColumn';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface DobWheelPickerProps {
  value: string;
  onChange: (dob: string) => void;
  hasError?: boolean;
}

interface DraftParts {
  year: number;
  month: number;
  day: number;
}

const MIN_YEAR = 1900;
const MIN_DATE = new Date(MIN_YEAR, 0, 1);
const DEFAULT_INITIAL_DATE = new Date(2005, 0, 1);
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

function clampDate(date: Date): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date.getTime() < MIN_DATE.getTime()) return new Date(MIN_DATE.getTime());
  if (date.getTime() > today.getTime()) return today;
  return date;
}

function parseLocalDob(dob: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob.trim());
  if (!match) return clampDate(DEFAULT_INITIAL_DATE);

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  const parsed = new Date(year, month - 1, day);

  if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) {
    return clampDate(DEFAULT_INITIAL_DATE);
  }
  return clampDate(parsed);
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toDraftParts(date: Date): DraftParts {
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
}

function clampDraftParts(year: number, month: number, day: number, maxDate: Date): DraftParts {
  const maxYear = maxDate.getFullYear();
  const clampedYear = Math.max(MIN_YEAR, Math.min(maxYear, year));
  const maxMonth = clampedYear === maxYear ? maxDate.getMonth() + 1 : 12;
  const clampedMonth = Math.max(1, Math.min(maxMonth, month));
  const daysInMonth = new Date(clampedYear, clampedMonth, 0).getDate();
  const maxDay = clampedYear === maxYear && clampedMonth === maxMonth ? Math.min(daysInMonth, maxDate.getDate()) : daysInMonth;
  return { year: clampedYear, month: clampedMonth, day: Math.max(1, Math.min(maxDay, day)) };
}

export function DobWheelPicker({ value, onChange, hasError = false }: DobWheelPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [maxDate, setMaxDate] = useState<Date>(() => new Date());
  const [iosDraftDate, setIosDraftDate] = useState<Date>(() => parseLocalDob(value));
  const [webDraft, setWebDraft] = useState<DraftParts>(() => toDraftParts(parseLocalDob(value)));

  const yearItems = useMemo<WheelItem[]>(() => {
    const endYear = maxDate.getFullYear();
    const list: WheelItem[] = [];
    for (let y = endYear; y >= MIN_YEAR; y--) list.push({ label: String(y), value: y });
    return list;
  }, [maxDate]);

  const monthItems = useMemo<WheelItem[]>(() => {
    const limit = webDraft.year === maxDate.getFullYear() ? maxDate.getMonth() + 1 : 12;
    return MONTH_NAMES.slice(0, limit).map((label, idx) => ({ label, value: idx + 1 }));
  }, [maxDate, webDraft.year]);

  const dayItems = useMemo<WheelItem[]>(() => {
    const daysInMonth = new Date(webDraft.year, webDraft.month, 0).getDate();
    const isCurrentMonth = webDraft.year === maxDate.getFullYear() && webDraft.month === maxDate.getMonth() + 1;
    const limit = isCurrentMonth ? Math.min(daysInMonth, maxDate.getDate()) : daysInMonth;
    const list: WheelItem[] = [];
    for (let d = 1; d <= limit; d++) list.push({ label: String(d).padStart(2, '0'), value: d });
    return list;
  }, [maxDate, webDraft.month, webDraft.year]);

  function handleOpen() {
    const now = new Date();
    setMaxDate(now);
    const initial = parseLocalDob(value);
    if (Platform.OS === 'ios' || Platform.OS === 'web') {
      setIosDraftDate(initial);
      setWebDraft(toDraftParts(initial));
    }
    setIsOpen(true);
  }

  function handleAndroidChange(event: DateTimePickerEvent, selectedDate?: Date) {
    setIsOpen(false);
    if (event.type === 'set' && selectedDate) onChange(formatLocalDate(selectedDate));
  }

  function handleIosChange(_event: DateTimePickerEvent, selectedDate?: Date) {
    if (selectedDate) setIosDraftDate(selectedDate);
  }

  function handleCancel() {
    setIsOpen(false);
  }

  function handleDone() {
    const nextDate = Platform.OS === 'ios' ? iosDraftDate : new Date(webDraft.year, webDraft.month - 1, webDraft.day);
    onChange(formatLocalDate(nextDate));
    setIsOpen(false);
  }

  const hasValue = Boolean(value.trim());
  const isModalVisible = isOpen && (Platform.OS === 'ios' || Platform.OS === 'web');

  return (
    <View>
      <TouchableOpacity
        style={[styles.trigger, hasError ? styles.inputError : null]}
        onPress={handleOpen}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Select Date of Birth"
        accessibilityState={{ expanded: isOpen }}
      >
        <Text style={hasValue ? styles.valueText : styles.placeholderText}>
          {hasValue ? value : 'Select Date of Birth'}
        </Text>
        <Text style={styles.actionText}>{hasValue ? 'Change' : 'Select'}</Text>
      </TouchableOpacity>

      {isOpen && Platform.OS === 'android' ? (
        <DateTimePicker
          value={parseLocalDob(value)}
          mode="date"
          display="spinner"
          minimumDate={MIN_DATE}
          maximumDate={maxDate}
          onChange={handleAndroidChange}
        />
      ) : null}

      <Modal visible={isModalVisible} transparent animationType="fade" onRequestClose={handleCancel}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard} accessibilityViewIsModal>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date of Birth</Text>
            </View>

            {Platform.OS === 'ios' ? (
              <DateTimePicker
                value={iosDraftDate}
                mode="date"
                display="spinner"
                minimumDate={MIN_DATE}
                maximumDate={maxDate}
                onChange={handleIosChange}
                textColor={colors.text}
                themeVariant="light"
              />
            ) : (
              <View style={styles.wheelRow}>
                <WheelColumn items={monthItems} selectedValue={webDraft.month} onSelect={(m) => setWebDraft((p) => clampDraftParts(p.year, m, p.day, maxDate))} accessibilityLabel="Select Birth Month" />
                <WheelColumn items={dayItems} selectedValue={webDraft.day} onSelect={(d) => setWebDraft((p) => clampDraftParts(p.year, p.month, d, maxDate))} accessibilityLabel="Select Birth Day" />
                <WheelColumn items={yearItems} selectedValue={webDraft.year} onSelect={(y) => setWebDraft((p) => clampDraftParts(y, p.month, p.day, maxDate))} accessibilityLabel="Select Birth Year" />
              </View>
            )}

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Cancel date selection">
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.doneBtn} onPress={handleDone} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Confirm date selection">
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: { backgroundColor: colors.background, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inputError: { borderColor: colors.danger },
  valueText: { fontSize: typography.fontSizes.base, fontFamily: typography.fontFamily.secondary, color: colors.text },
  placeholderText: { fontSize: typography.fontSizes.base, fontFamily: typography.fontFamily.secondary, color: colors.textMuted },
  actionText: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondarySemiBold, color: colors.primary },
  modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg, backgroundColor: 'rgba(15, 23, 42, 0.55)' },
  modalCard: { width: '100%', maxWidth: 400, backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  modalHeader: { paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.background },
  modalTitle: { fontSize: typography.fontSizes.lg, fontFamily: typography.fontFamily.mainSemiBold, color: colors.text, textAlign: 'center' },
  wheelRow: { flexDirection: 'row', paddingHorizontal: spacing.xs, paddingVertical: spacing.sm, gap: spacing.xs },
  actionRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background },
  cancelBtn: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: colors.border },
  cancelText: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondarySemiBold, color: colors.textSecondary },
  doneBtn: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  doneText: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondaryBold, color: colors.textLight },
});
