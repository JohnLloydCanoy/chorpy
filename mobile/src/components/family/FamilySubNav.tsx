import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';

export type FamilySubTab = 'chores' | 'family' | 'calendar';

interface FamilySubNavProps {
  activeTab: FamilySubTab;
  onSelectTab: (tab: FamilySubTab) => void;
}

interface SubNavButtonProps {
  id: FamilySubTab;
  label: string;
  isActive: boolean;
  onSelect: (tab: FamilySubTab) => void;
}

const TABS: readonly { id: FamilySubTab; label: string }[] = [
  { id: 'chores', label: 'Chores' },
  { id: 'family', label: 'Family' },
  { id: 'calendar', label: 'Calendar' },
];

const SubNavButton = React.memo(function SubNavButton({
  id,
  label,
  isActive,
  onSelect,
}: SubNavButtonProps) {
  const handlePress = useCallback(() => {
    onSelect(id);
  }, [id, onSelect]);

  return (
    <TouchableOpacity
      style={[styles.tabButton, isActive ? styles.tabButtonActive : styles.tabButtonInactive]}
      onPress={handlePress}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={`${label} tab`}
      activeOpacity={0.8}
    >
      <Text
        style={[styles.tabLabel, isActive ? styles.tabLabelActive : styles.tabLabelInactive]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
});

export const FamilySubNav = React.memo(function FamilySubNav({
  activeTab,
  onSelectTab,
}: FamilySubNavProps) {
  return (
    <View style={styles.container} accessibilityRole="tablist">
      {TABS.map((tab) => (
        <SubNavButton
          key={tab.id}
          id={tab.id}
          label={tab.label}
          isActive={activeTab === tab.id}
          onSelect={onSelectTab}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flexDirection: 'row', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: spacing.xs, gap: spacing.xs, marginBottom: spacing.md },
  tabButton: { flex: 1, minHeight: 48, borderRadius: borderRadius.sm, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.sm },
  tabButtonActive: { backgroundColor: colors.primary },
  tabButtonInactive: { backgroundColor: colors.surface },
  tabLabel: { fontSize: typography.fontSizes.sm },
  tabLabelActive: { color: colors.textLight, fontFamily: typography.fontFamily.secondaryBold },
  tabLabelInactive: { color: colors.primary, fontFamily: typography.fontFamily.secondaryMedium },
});
