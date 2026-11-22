import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNotificationState } from '../../context/NotificationContext';
import { borderRadius, colors, iconSizes, spacing } from '../../theme';
import { Chore, UserRole } from '../../types';
import { buildChoreNotifications, ChoreNotificationItem } from '../../utils/notificationUtils';
import { FoldedMapIcon, NotificationBellIcon } from './HomeHeaderIcons';
import { NotificationAnchorRect, NotificationDropdown } from './NotificationDropdown';

export interface HomeHeaderActionsProps {
  role: UserRole;
  chores: Chore[];
  memberNameMap: Record<string, string>;
  loading?: boolean;
  error?: string | null;
  isPartial?: boolean;
  pendingIds?: Record<string, boolean>;
  onRetry?: () => void;
  onSelectChore?: (chore: Chore) => void;
  onPressLocation?: () => void;
}

const BUTTON_SIZE = 48;
const EMPTY_PENDING: Record<string, boolean> = {};

export const HomeHeaderActions = React.memo(function HomeHeaderActions({
  role,
  chores,
  memberNameMap,
  loading = false,
  error = null,
  isPartial = false,
  pendingIds = EMPTY_PENDING,
  onRetry,
  onSelectChore,
  onPressLocation,
}: HomeHeaderActionsProps) {
  const { lastSeenAt, readIds, hydrated, markAllRead, markItemRead } = useNotificationState();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [anchor, setAnchor] = useState<NotificationAnchorRect | null>(null);
  const [openedAtMs, setOpenedAtMs] = useState<number>(() => Date.now());
  const bellRef = useRef<React.ComponentRef<typeof View>>(null);

  const notifications = useMemo(
    () =>
      buildChoreNotifications(
        chores,
        role,
        memberNameMap,
        lastSeenAt,
        readIds,
        pendingIds,
        openedAtMs
      ),
    [chores, lastSeenAt, memberNameMap, openedAtMs, pendingIds, readIds, role]
  );

  const unreadCount = useMemo(
    () => (hydrated ? notifications.filter((item) => item.isUnread).length : 0),
    [hydrated, notifications]
  );

  const newestTimestampMs = notifications.length > 0 ? notifications[0].timestampMs : 0;

  const handleToggleNotifications = useCallback(() => {
    if (dropdownOpen) {
      setDropdownOpen(false);
      return;
    }
    setOpenedAtMs(Date.now());
    const node = bellRef.current;
    if (node && typeof node.measureInWindow === 'function') {
      node.measureInWindow((x, y, width, height) => {
        if (width > 0 && height > 0) {
          setAnchor({ x, y, width, height });
        }
        setDropdownOpen(true);
      });
      return;
    }
    setDropdownOpen(true);
  }, [dropdownOpen]);

  const handleCloseDropdown = useCallback(() => {
    setDropdownOpen(false);
  }, []);

  const handleMarkAllRead = useCallback(() => {
    markAllRead(newestTimestampMs);
  }, [markAllRead, newestTimestampMs]);

  const handleSelectNotification = useCallback(
    (item: ChoreNotificationItem) => {
      markItemRead(item.choreId);
      setDropdownOpen(false);
      onSelectChore?.(item.chore);
    },
    [markItemRead, onSelectChore]
  );

  const hasUnread = unreadCount > 0;
  const notificationLabel = hasUnread
    ? `Notifications, ${unreadCount} unread updates`
    : 'Notifications';

  return (
    <View style={styles.actionsRow}>
      <View ref={bellRef} collapsable={false}>
        <TouchableOpacity
          style={[styles.iconButton, dropdownOpen && styles.iconButtonActive]}
          onPress={handleToggleNotifications}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={notificationLabel}
          accessibilityState={{ expanded: dropdownOpen }}
        >
          <NotificationBellIcon size={iconSizes.md} color={colors.primary} />
          {hasUnread ? <View style={styles.badgeDot} /> : null}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.iconButton}
        onPress={onPressLocation}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Location map"
      >
        <FoldedMapIcon size={iconSizes.md} color={colors.primary} />
      </TouchableOpacity>

      <NotificationDropdown
        visible={dropdownOpen}
        anchor={anchor}
        role={role}
        items={notifications}
        unreadCount={unreadCount}
        loading={loading}
        error={error}
        isPartial={isPartial}
        onRetry={onRetry}
        onMarkAllRead={handleMarkAllRead}
        onSelectItem={handleSelectNotification}
        onClose={handleCloseDropdown}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 0,
  },
  iconButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconButtonActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  badgeDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
});
