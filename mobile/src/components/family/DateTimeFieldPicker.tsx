import React, { useCallback, useEffect } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Svg, { Path } from 'react-native-svg';
import { borderRadius, colors, iconSizes, spacing, typography } from '../../theme';
import {
  formatScheduleDateLabel,
  formatScheduleTimeLabel,
  mergeDatePart,
  mergeTimePart,
} from '../../utils/choreScheduleUtils';
import { WebDateTimeWheel } from './WebDateTimeWheel';

export type PickerTarget = 'date' | 'time' | null;

export interface DateTimeFieldPickerProps {
  label: string;
  value: Date;
  activeTarget: PickerTarget;
  disabled?: boolean;
  hasError?: boolean;
  onChangeTarget: (target: PickerTarget) => void;
  onChangeValue: (next: Date) => void;
}

const ModalCloseIcon = React.memo(function ModalCloseIcon() {
  return (
    <Svg
      width={iconSizes.md}
      height={iconSizes.md}
      viewBox="0 0 24 24"
      fill="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Path
        d="M18 6L6 18M6 6l12 12"
        stroke={colors.textSecondary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});

export const DateTimeFieldPicker = React.memo(function DateTimeFieldPicker({
  label,
  value,
  activeTarget,
  disabled = false,
  hasError = false,
  onChangeTarget,
  onChangeValue,
}: DateTimeFieldPickerProps) {
  const handleToggleDate = useCallback(() => {
    if (disabled) return;
    onChangeTarget(activeTarget === 'date' ? null : 'date');
  }, [activeTarget, disabled, onChangeTarget]);

  const handleToggleTime = useCallback(() => {
    if (disabled) return;
    onChangeTarget(activeTarget === 'time' ? null : 'time');
  }, [activeTarget, disabled, onChangeTarget]);

  const handleClose = useCallback(() => {
    onChangeTarget(null);
  }, [onChangeTarget]);

  useEffect(() => {
    if (Platform.OS !== 'web' || !activeTarget || typeof window === 'undefined') return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTarget, handleClose]);

  const handleAndroidChange = useCallback(
    (event: DateTimePickerEvent, selected?: Date) => {
      const mode = activeTarget;
      onChangeTarget(null);
      if (event.type !== 'set' || !selected || !mode) return;
      onChangeValue(mode === 'date' ? mergeDatePart(value, selected) : mergeTimePart(value, selected));
    },
    [activeTarget, onChangeTarget, onChangeValue, value]
  );

  const handleIosChange = useCallback(
    (_event: DateTimePickerEvent, selected?: Date) => {
      if (!selected || !activeTarget) return;
      onChangeValue(activeTarget === 'date' ? mergeDatePart(value, selected) : mergeTimePart(value, selected));
    },
    [activeTarget, onChangeValue, value]
  );

  const handleWebChange = useCallback(
    (next: Date) => {
      if (!activeTarget) return;
      onChangeValue(activeTarget === 'date' ? mergeDatePart(value, next) : mergeTimePart(value, next));
    },
    [activeTarget, onChangeValue, value]
  );

  const dateText = formatScheduleDateLabel(value);
  const timeText = formatScheduleTimeLabel(value);
  const showPopupModal = Boolean(activeTarget) && Platform.OS !== 'android';
  const modalTitle = activeTarget === 'date' ? `${label} — Select Date` : `${label} — Select Time`;

  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.triggerRow}>
        <TouchableOpacity
          style={[
            styles.triggerBtn,
            activeTarget === 'date' && styles.triggerActive,
            hasError && styles.triggerError,
            disabled && styles.triggerDisabled,
          ]}
          onPress={handleToggleDate}
          disabled={disabled}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`${label} date, ${dateText}`}
          accessibilityState={{ expanded: activeTarget === 'date', disabled }}
        >
          <Text style={styles.triggerCaption}>Date</Text>
          <Text style={styles.triggerValue} numberOfLines={1}>{dateText}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.triggerBtn,
            activeTarget === 'time' && styles.triggerActive,
            hasError && styles.triggerError,
            disabled && styles.triggerDisabled,
          ]}
          onPress={handleToggleTime}
          disabled={disabled}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`${label} time, ${timeText}`}
          accessibilityState={{ expanded: activeTarget === 'time', disabled }}
        >
          <Text style={styles.triggerCaption}>Time</Text>
          <Text style={styles.triggerValue} numberOfLines={1}>{timeText}</Text>
        </TouchableOpacity>
      </View>

      {activeTarget && Platform.OS === 'android' ? (
        <DateTimePicker
          value={value}
          mode={activeTarget}
          display="default"
          onChange={handleAndroidChange}
        />
      ) : null}

      <Modal
        visible={showPopupModal}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Dismiss date and time picker"
          />
          <View style={styles.modalDialog} accessibilityViewIsModal>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {modalTitle}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={handleClose}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Close date and time picker"
              >
                <ModalCloseIcon />
              </TouchableOpacity>
            </View>

            {activeTarget && Platform.OS === 'ios' ? (
              <>
                <DateTimePicker
                  value={value}
                  mode={activeTarget}
                  display="spinner"
                  textColor={colors.text}
                  themeVariant="light"
                  onChange={handleIosChange}
                />
                <TouchableOpacity
                  style={styles.doneBtn}
                  onPress={handleClose}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`Confirm ${label} ${activeTarget}`}
                >
                  <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
              </>
            ) : null}

            {activeTarget && Platform.OS === 'web' ? (
              <WebDateTimeWheel
                mode={activeTarget}
                value={value}
                onChange={handleWebChange}
                onDone={handleClose}
              />
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  fieldBlock: { marginTop: spacing.sm },
  label: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondaryMedium, color: colors.text, marginBottom: spacing.xs },
  triggerRow: { flexDirection: 'row', gap: spacing.xs },
  triggerBtn: { flex: 1, minHeight: 48, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, justifyContent: 'center' },
  triggerActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  triggerError: { borderColor: colors.danger },
  triggerDisabled: { opacity: 0.55 },
  triggerCaption: { fontSize: typography.fontSizes.xs, fontFamily: typography.fontFamily.secondaryMedium, color: colors.textMuted },
  triggerValue: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondarySemiBold, color: colors.text },
  modalBackdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center', padding: spacing.md },
  modalDialog: { width: '92%', maxWidth: 380, backgroundColor: colors.surface, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: spacing.md, paddingRight: spacing.xs, minHeight: 52, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { flex: 1, fontFamily: typography.fontFamily.mainSemiBold, fontSize: typography.fontSizes.base, color: colors.primary },
  modalCloseBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  doneBtn: { minHeight: 48, backgroundColor: colors.primarySoft, borderTopWidth: 1, borderTopColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  doneText: { fontFamily: typography.fontFamily.secondaryBold, fontSize: typography.fontSizes.sm, color: colors.primary },
});
