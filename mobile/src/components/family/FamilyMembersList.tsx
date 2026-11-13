import React, { useCallback, useMemo } from 'react';
import { FlatList, ListRenderItem, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { Profile } from '../../types';

export const MEMBER_ROW_HEIGHT = 68;

interface FamilyMembersListProps {
  members: Profile[];
  loading: boolean;
  error: string | null;
  hasHousehold: boolean;
  currentUserId?: string;
  onRetry: () => void;
}

interface FamilyMemberRowProps {
  member: Profile;
  isCurrentUser: boolean;
}

const FamilyMemberRow = React.memo(function FamilyMemberRow({
  member,
  isCurrentUser,
}: FamilyMemberRowProps) {
  const baseName = member.full_name?.trim() || member.email.split('@')[0] || 'Member';
  const displayName = isCurrentUser ? `${baseName} (You)` : baseName;
  const isParent = member.role === 'parent';

  return (
    <View style={styles.row}>
      <View style={styles.colMember}>
        <Text style={styles.memberName} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={styles.memberEmail} numberOfLines={1}>
          {member.email}
        </Text>
      </View>
      <View style={styles.colRole}>
        <View style={[styles.badge, isParent ? styles.badgeParent : styles.badgeChild]}>
          <Text style={styles.badgeText} numberOfLines={1}>
            {isParent ? 'Parent' : 'Child'}
          </Text>
        </View>
      </View>
    </View>
  );
});

export const FamilyMembersList = React.memo(function FamilyMembersList({
  members,
  loading,
  error,
  hasHousehold,
  currentUserId,
  onRetry,
}: FamilyMembersListProps) {
  const keyExtractor = useCallback((item: Profile) => item.id, []);

  const getItemLayout = useCallback(
    (_data: ArrayLike<Profile> | null | undefined, index: number) => ({
      length: MEMBER_ROW_HEIGHT,
      offset: MEMBER_ROW_HEIGHT * index,
      index,
    }),
    []
  );

  const renderItem: ListRenderItem<Profile> = useCallback(
    ({ item }) => (
      <FamilyMemberRow member={item} isCurrentUser={Boolean(currentUserId && item.id === currentUserId)} />
    ),
    [currentUserId]
  );

  const listHeader = useMemo(
    () => (
      <View>
        {error ? (
          <View style={styles.bannerPartial}>
            <Text style={styles.bannerPartialText}>
              Showing cached members. Sync issue: {error}
            </Text>
            <TouchableOpacity
              style={styles.bannerAction}
              onPress={onRetry}
              accessibilityRole="button"
              accessibilityLabel="Retry loading household members"
            >
              <Text style={styles.bannerActionText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, styles.colMember]}>Member</Text>
          <Text style={[styles.headerCell, styles.colRoleText]}>Role</Text>
        </View>
      </View>
    ),
    [error, onRetry]
  );

  if (loading && members.length === 0) {
    return (
      <View style={styles.tableContainer} accessibilityLabel="Loading family members">
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, styles.colMember]}>Member</Text>
          <Text style={[styles.headerCell, styles.colRoleText]}>Role</Text>
        </View>
        <View style={styles.skeletonRow}><View style={styles.skeletonBarWide} /><View style={styles.skeletonBarNarrow} /></View>
        <View style={styles.skeletonRow}><View style={styles.skeletonBarWide} /><View style={styles.skeletonBarNarrow} /></View>
        <View style={styles.skeletonRow}><View style={styles.skeletonBarWide} /><View style={styles.skeletonBarNarrow} /></View>
        <View style={styles.skeletonRow}><View style={styles.skeletonBarWide} /><View style={styles.skeletonBarNarrow} /></View>
      </View>
    );
  }

  if (error && members.length === 0) {
    return (
      <View style={styles.stateBox}>
        <Text style={styles.stateTitle}>Unable to Load Members</Text>
        <Text style={styles.stateBody}>{error}</Text>
        <TouchableOpacity
          style={styles.primaryAction}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry loading household members"
        >
          <Text style={styles.primaryActionText}>Retry Loading Members</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!loading && members.length === 0) {
    const emptyBody = !hasHousehold
      ? 'No household is linked yet. Join or create a family circle in Settings first.'
      : 'No family members found yet. Invite members using your household Pairing PIN in Settings.';

    return (
      <View style={styles.stateBox}>
        <Text style={styles.stateTitle}>No Family Members Yet</Text>
        <Text style={styles.stateBody}>{emptyBody}</Text>
        {hasHousehold ? (
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel="Refresh family members"
          >
            <Text style={styles.primaryActionText}>Refresh Members</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.tableContainer}>
      <FlatList
        data={members}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        ListHeaderComponent={listHeader}
        removeClippedSubviews
        maxToRenderPerBatch={15}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={onRetry}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  tableContainer: { flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerCell: { fontSize: typography.fontSizes.xs, fontFamily: typography.fontFamily.secondaryBold, color: colors.textSecondary },
  colMember: { flex: 2.2, paddingRight: spacing.sm },
  colRole: { flex: 1, alignItems: 'flex-end' },
  colRoleText: { flex: 1, textAlign: 'right' },
  row: { height: MEMBER_ROW_HEIGHT, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  memberName: { fontSize: typography.fontSizes.base, fontFamily: typography.fontFamily.mainSemiBold, color: colors.text },
  memberEmail: { fontSize: typography.fontSizes.xs, fontFamily: typography.fontFamily.secondary, color: colors.textSecondary, marginTop: 2 },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
  badgeParent: { backgroundColor: colors.primarySoft },
  badgeChild: { backgroundColor: colors.secondarySoft },
  badgeText: { fontSize: typography.fontSizes.xs, fontFamily: typography.fontFamily.secondaryBold, color: colors.primary },
  skeletonRow: { height: MEMBER_ROW_HEIGHT, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  skeletonBarWide: { width: '55%', height: 14, borderRadius: borderRadius.sm, backgroundColor: colors.border },
  skeletonBarNarrow: { width: '24%', height: 14, borderRadius: borderRadius.sm, backgroundColor: colors.border },
  stateBox: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  stateTitle: { fontSize: typography.fontSizes.lg, fontFamily: typography.fontFamily.mainSemiBold, color: colors.primary, marginBottom: spacing.xs, textAlign: 'center' },
  stateBody: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondary, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.md },
  primaryAction: { minHeight: 48, backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingHorizontal: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  primaryActionText: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondaryBold, color: colors.textLight },
  bannerPartial: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.secondarySoft, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border },
  bannerPartialText: { flex: 1, fontSize: typography.fontSizes.xs, fontFamily: typography.fontFamily.secondaryMedium, color: colors.primary },
  bannerAction: { minHeight: 48, paddingHorizontal: spacing.sm, justifyContent: 'center' },
  bannerActionText: { fontSize: typography.fontSizes.xs, fontFamily: typography.fontFamily.secondaryBold, color: colors.primary },
});
