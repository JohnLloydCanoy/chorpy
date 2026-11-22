import React, { useCallback, useEffect, useMemo } from 'react';
import {
  FlatList,
  ListRenderItem,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { borderRadius, colors, spacing, typography } from '../../theme';
import { UserRole } from '../../types';
import { ChoreNotificationItem } from '../../utils/notificationUtils';
import { NOTIFICATION_ROW_HEIGHT, NotificationRow } from './NotificationRow';

export interface NotificationAnchorRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface NotificationDropdownProps {
  visible: boolean;
  anchor: NotificationAnchorRect | null;
  role: UserRole;
  items: ChoreNotificationItem[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  isPartial: boolean;
  onRetry?: () => void;
  onMarkAllRead: () => void;
  onSelectItem: (item: ChoreNotificationItem) => void;
  onClose: () => void;
}

const CARET_WIDTH = 16;
const CARET_HEIGHT = 9;

export const NotificationDropdown = React.memo(function NotificationDropdown({
  visible,
  anchor,
  role,
  items,
  unreadCount,
  loading,
  error,
  isPartial,
  onRetry,
  onMarkAllRead,
  onSelectItem,
  onClose,
}: NotificationDropdownProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  useEffect(() => {
    if (!visible || Platform.OS !== 'web' || typeof window === 'undefined') return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, onClose]);

  const geometry = useMemo(() => {
    const horizontalMargin = spacing.md;
    const popoverWidth = Math.max(260, Math.min(360, windowWidth - horizontalMargin * 2));
    const top = anchor ? Math.round(anchor.y + anchor.height + spacing.xs) : 168;
    const rawLeft = anchor
      ? Math.round(anchor.x + anchor.width - popoverWidth)
      : Math.round(windowWidth - popoverWidth - horizontalMargin);
    const left = Math.max(
      horizontalMargin,
      Math.min(rawLeft, windowWidth - popoverWidth - horizontalMargin)
    );
    const maxHeight = Math.max(220, Math.min(440, windowHeight - top - spacing.lg));
    const anchorCenterX = anchor ? anchor.x + anchor.width / 2 : left + popoverWidth - 28;
    const caretLeft = Math.max(
      borderRadius.lg,
      Math.min(Math.round(anchorCenterX - left - CARET_WIDTH / 2), popoverWidth - borderRadius.lg - CARET_WIDTH)
    );
    return { popoverWidth, top, left, maxHeight, caretLeft };
  }, [anchor, windowHeight, windowWidth]);

  const keyExtractor = useCallback((item: ChoreNotificationItem) => item.id, []);

  const getItemLayout = useCallback(
    (_data: ArrayLike<ChoreNotificationItem> | null | undefined, index: number) => ({
      length: NOTIFICATION_ROW_HEIGHT,
      offset: NOTIFICATION_ROW_HEIGHT * index,
      index,
    }),
    []
  );

  const renderItem: ListRenderItem<ChoreNotificationItem> = useCallback(
    ({ item }) => <NotificationRow item={item} onPress={onSelectItem} />,
    [onSelectItem]
  );

  const popoverPositionStyle = useMemo(
    () => ({
      top: geometry.top,
      left: geometry.left,
      width: geometry.popoverWidth,
      maxHeight: geometry.maxHeight,
    }),
    [geometry.left, geometry.maxHeight, geometry.popoverWidth, geometry.top]
  );

  const caretPositionStyle = useMemo(
    () => ({ left: geometry.caretLeft }),
    [geometry.caretLeft]
  );

  const emptyMessage =
    role === 'parent'
      ? 'No created chores yet. New household chores will appear here.'
      : 'No tasks assigned yet. Assigned chores will appear here.';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close notifications dropdown"
        />

        <View
          style={[styles.popoverWrapper, popoverPositionStyle]}
          accessibilityViewIsModal
        >
          <View style={[styles.caretWrap, caretPositionStyle]} pointerEvents="none">
            <Svg width={CARET_WIDTH} height={CARET_HEIGHT} viewBox="0 0 16 9" fill="none">
              <Path d="M1 9L8 1L15 9" fill={colors.surface} stroke={colors.border} strokeWidth={1.25} />
            </Svg>
          </View>

          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Notifications</Text>
              {unreadCount > 0 ? (
                <TouchableOpacity
                  style={styles.markAllBtn}
                  onPress={onMarkAllRead}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Mark all notifications as read"
                >
                  <Text style={styles.markAllText}>Mark all read</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {isPartial && items.length > 0 ? (
              <View style={styles.partialBanner}>
                <Text style={styles.partialBannerText} numberOfLines={1}>
                  {error ? 'Showing cached notifications' : 'Syncing latest chores...'}
                </Text>
              </View>
            ) : null}

            {loading && items.length === 0 ? (
              <View style={styles.skeletonWrap} accessibilityLabel="Loading notifications">
                <View style={styles.skeletonRow}><View style={styles.skeletonCircle} /><View style={styles.skeletonLines}><View style={styles.skeletonBarLg} /><View style={styles.skeletonBarSm} /></View></View>
                <View style={styles.skeletonRow}><View style={styles.skeletonCircle} /><View style={styles.skeletonLines}><View style={styles.skeletonBarLg} /><View style={styles.skeletonBarSm} /></View></View>
                <View style={styles.skeletonRow}><View style={styles.skeletonCircle} /><View style={styles.skeletonLines}><View style={styles.skeletonBarLg} /><View style={styles.skeletonBarSm} /></View></View>
              </View>
            ) : error && items.length === 0 ? (
              <View style={styles.stateBox}>
                <Text style={styles.stateTitle}>Unable to Load</Text>
                <Text style={styles.stateBody}>{error}</Text>
                {onRetry ? (
                  <TouchableOpacity
                    style={styles.retryBtn}
                    onPress={onRetry}
                    accessibilityRole="button"
                    accessibilityLabel="Retry loading notifications"
                  >
                    <Text style={styles.retryText}>Retry</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : items.length === 0 ? (
              <View style={styles.stateBox}>
                <Text style={styles.stateTitle}>No Notifications Yet</Text>
                <Text style={styles.stateBody}>{emptyMessage}</Text>
              </View>
            ) : (
              <FlatList
                data={items}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                getItemLayout={getItemLayout}
                removeClippedSubviews
                maxToRenderPerBatch={12}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalRoot: { flex: 1 },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  popoverWrapper: { position: 'absolute', zIndex: 200 },
  caretWrap: { position: 'absolute', top: -CARET_HEIGHT + 1, zIndex: 2 },
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', maxHeight: '100%', shadowColor: colors.text, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.16, shadowRadius: 16, elevation: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, minHeight: 52, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
  headerTitle: { fontFamily: typography.fontFamily.mainBold, fontSize: typography.fontSizes.base, color: colors.primary },
  markAllBtn: { minHeight: 48, justifyContent: 'center', paddingHorizontal: spacing.xs },
  markAllText: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: typography.fontSizes.xs, color: colors.primary },
  partialBanner: { backgroundColor: colors.secondarySoft, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  partialBannerText: { fontFamily: typography.fontFamily.secondaryMedium, fontSize: typography.fontSizes.xs, color: colors.primary },
  skeletonWrap: { paddingVertical: spacing.xs },
  skeletonRow: { height: NOTIFICATION_ROW_HEIGHT, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  skeletonCircle: { width: 40, height: 40, borderRadius: borderRadius.full, backgroundColor: colors.border },
  skeletonLines: { flex: 1, gap: spacing.xs },
  skeletonBarLg: { width: '72%', height: 12, borderRadius: borderRadius.sm, backgroundColor: colors.border },
  skeletonBarSm: { width: '48%', height: 10, borderRadius: borderRadius.sm, backgroundColor: colors.background },
  stateBox: { padding: spacing.lg, alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  stateTitle: { fontFamily: typography.fontFamily.mainSemiBold, fontSize: typography.fontSizes.base, color: colors.primary, textAlign: 'center' },
  stateBody: { fontFamily: typography.fontFamily.secondary, fontSize: typography.fontSizes.xs, color: colors.textSecondary, textAlign: 'center', lineHeight: 18 },
  retryBtn: { marginTop: spacing.xs, minHeight: 48, minWidth: 112, paddingHorizontal: spacing.md, borderRadius: borderRadius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  retryText: { fontFamily: typography.fontFamily.secondaryBold, fontSize: typography.fontSizes.xs, color: colors.textLight },
});
