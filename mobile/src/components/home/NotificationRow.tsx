import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, iconSizes, spacing, typography } from '../../theme';
import { ChoreNotificationItem } from '../../utils/notificationUtils';
import { ChoreTaskIcon } from './HomeHeaderIcons';

export const NOTIFICATION_ROW_HEIGHT = 80;

interface NotificationRowProps {
  item: ChoreNotificationItem;
  onPress: (item: ChoreNotificationItem) => void;
}

export const NotificationRow = React.memo(function NotificationRow({
  item,
  onPress,
}: NotificationRowProps) {
  const handlePress = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  return (
    <TouchableOpacity
      style={[styles.row, item.isUnread && styles.rowUnread, item.isPendingSync && styles.rowDisabled]}
      onPress={handlePress}
      disabled={item.isPendingSync}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${item.categoryLabel}: ${item.title}, ${item.timeLabel}`}
      accessibilityHint="Opens chore details"
      accessibilityState={{ disabled: item.isPendingSync }}
    >
      <View style={[styles.avatar, item.isUrgent ? styles.avatarUrgent : styles.avatarDefault]}>
        <ChoreTaskIcon
          size={iconSizes.md}
          color={item.isUrgent ? colors.danger : colors.primary}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.categoryRow}>
          <Text
            style={[styles.categoryLabel, item.isUrgent && styles.categoryUrgent]}
            numberOfLines={1}
          >
            {item.categoryLabel}
          </Text>
          {item.isPendingSync ? (
            <Text style={styles.savingTag} numberOfLines={1}>
              Saving
            </Text>
          ) : null}
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.detailText} numberOfLines={1}>
            {item.detailText}
          </Text>
          <Text style={styles.timeText} numberOfLines={1}>
            {item.timeLabel}
          </Text>
        </View>
      </View>

      <View style={styles.trailing}>
        {item.isUnread ? <View style={styles.unreadDot} /> : null}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  row: {
    height: NOTIFICATION_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  rowUnread: {
    backgroundColor: colors.secondarySoft,
  },
  rowDisabled: {
    opacity: 0.6,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarDefault: {
    backgroundColor: colors.primarySoft,
  },
  avatarUrgent: {
    backgroundColor: colors.dangerSoft,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  categoryLabel: {
    fontFamily: typography.fontFamily.secondaryBold,
    fontSize: typography.fontSizes.xs,
    color: colors.primary,
  },
  categoryUrgent: {
    color: colors.danger,
  },
  savingTag: {
    fontFamily: typography.fontFamily.secondarySemiBold,
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
  },
  title: {
    fontFamily: typography.fontFamily.mainSemiBold,
    fontSize: typography.fontSizes.sm,
    color: colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  detailText: {
    flex: 1,
    fontFamily: typography.fontFamily.secondary,
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
  },
  timeText: {
    fontFamily: typography.fontFamily.secondaryMedium,
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
    flexShrink: 0,
  },
  trailing: {
    width: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
});
