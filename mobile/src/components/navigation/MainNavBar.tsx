import React, { useCallback } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, iconSizes, spacing, typography } from '../../theme';
import { NavTabIcon } from './NavTabIcon';

const primaryBgImage = require('../../../assets/Background-of-Primary-Color.png');

export type ScreenName = 'home' | 'my_family' | 'settings';

export interface NavTabItem {
  id: ScreenName;
  label: string;
}

export const NAV_TABS: readonly NavTabItem[] = [
  { id: 'home', label: 'HOME' },
  { id: 'my_family', label: 'MY FAMILY' },
  { id: 'settings', label: 'SETTING' },
];

interface NavTabButtonProps {
  id: ScreenName;
  label: string;
  isActive: boolean;
  showLabel: boolean;
  onSelect: (screen: ScreenName) => void;
}

const NavTabButton = React.memo(function NavTabButton({
  id,
  label,
  isActive,
  showLabel,
  onSelect,
}: NavTabButtonProps) {
  const handlePress = useCallback(() => {
    onSelect(id);
  }, [id, onSelect]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.navButton, isActive && styles.navButtonActive]}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={`${label} navigation tab`}
      activeOpacity={0.85}
    >
      {isActive ? (
        <Image
          source={primaryBgImage}
          style={styles.navButtonBgImage}
          resizeMode="cover"
        />
      ) : null}
      <View style={styles.navButtonContent}>
        <NavTabIcon
          screen={id}
          size={showLabel ? iconSizes.sm : iconSizes.lg}
          color={isActive ? colors.textLight : colors.secondary}
        />
        {showLabel ? (
          <Text
            style={[styles.navButtonText, isActive && styles.navButtonTextActive]}
            numberOfLines={1}
          >
            {label}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
});

export interface MainNavBarProps {
  currentScreen: ScreenName;
  onSelectScreen: (screen: ScreenName) => void;
  showLabel?: boolean;
}

export const MainNavBar = React.memo(function MainNavBar({
  currentScreen,
  onSelectScreen,
  showLabel = true,
}: MainNavBarProps) {
  return (
    <View style={styles.navBar} accessibilityRole="tablist">
      {NAV_TABS.map((tab) => (
        <NavTabButton
          key={tab.id}
          id={tab.id}
          label={tab.label}
          isActive={currentScreen === tab.id}
          showLabel={showLabel}
          onSelect={onSelectScreen}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    justifyContent: 'space-around',
    gap: spacing.xs,
    zIndex: 10,
  },
  navButton: {
    flex: 1,
    minHeight: 48,
    minWidth: 48,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  navButtonActive: {
    backgroundColor: colors.primary,
  },
  navButtonBgImage: {
    position: 'absolute',
    top: 0,
    left: '-6%',
    right: '-6%',
    bottom: 0,
    width: '112%',
    height: '100%',
    zIndex: 1,
  },
  navButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    zIndex: 2,
  },
  navButtonText: {
    fontFamily: typography.fontFamily.secondarySemiBold,
    fontSize: typography.fontSizes.xs,
    color: colors.textSecondary,
  },
  navButtonTextActive: {
    fontFamily: typography.fontFamily.secondaryBold,
    color: colors.textLight,
  },
});
