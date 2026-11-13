import React, { useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { Profile } from '../../types';

interface ChildMemberPickerProps {
  childMembers: Profile[];
  selectedChildId: string;
  loading: boolean;
  error: string | null;
  onSelectChild: (id: string) => void;
  onRetry: () => void;
}

interface ChildChipProps {
  child: Profile;
  selected: boolean;
  onSelect: (id: string) => void;
}

const ChildChip = React.memo(function ChildChip({ child, selected, onSelect }: ChildChipProps) {
  const label = child.full_name?.trim() || child.email.split('@')[0] || 'Child';
  const handlePress = useCallback(() => {
    onSelect(child.id);
  }, [child.id, onSelect]);

  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`Assign chore to ${label}`}
      activeOpacity={0.8}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
});

export const ChildMemberPicker = React.memo(function ChildMemberPicker({
  childMembers,
  selectedChildId,
  loading,
  error,
  onSelectChild,
  onRetry,
}: ChildMemberPickerProps) {
  const keyExtractor = useCallback((item: Profile) => item.id, []);

  const renderChildChip: ListRenderItem<Profile> = useCallback(
    ({ item }) => (
      <ChildChip
        child={item}
        selected={item.id === selectedChildId}
        onSelect={onSelectChild}
      />
    ),
    [selectedChildId, onSelectChild]
  );

  if (loading) {
    return (
      <View style={styles.statusRow}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.statusText}>Loading household child members...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorBox}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry loading household members"
        >
          <Text style={styles.retryText}>Retry Loading Members</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (childMembers.length === 0) {
    return (
      <Text style={styles.noticeText}>
        No child members found in this household yet. Have a child join your family circle first.
      </Text>
    );
  }

  return (
    <FlatList
      horizontal
      data={childMembers}
      keyExtractor={keyExtractor}
      renderItem={renderChildChip}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipList}
      keyboardShouldPersistTaps="handled"
    />
  );
});

const styles = StyleSheet.create({
  chipList: { gap: spacing.sm, paddingVertical: spacing.xs },
  chip: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  chipText: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondaryMedium, color: colors.text },
  chipTextSelected: { color: colors.primary, fontFamily: typography.fontFamily.secondaryBold },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  statusText: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondary, color: colors.textSecondary },
  noticeText: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondary, color: colors.textSecondary, marginVertical: spacing.xs },
  errorBox: { marginVertical: spacing.xs, gap: spacing.xs },
  errorText: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondaryMedium, color: colors.danger },
  retryButton: {
    minHeight: 48,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  retryText: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondarySemiBold, color: colors.primary },
});
