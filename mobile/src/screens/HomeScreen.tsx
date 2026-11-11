import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, spacing, borderRadius, typography } from '../theme';

const primaryBgAsset = require('../../assets/Background-of-Primary-Color.png');

interface HomeScreenProps {
  role?: 'parent' | 'child';
  dbStatus?: 'checking' | 'connected' | 'error';
  statusMessage?: string;
  onNavigateToFamily?: () => void;
}

export default function HomeScreen({ onNavigateToFamily }: HomeScreenProps) {
  const heroCardHeight = Math.max(190, Math.round(Dimensions.get('window').height * 0.25));

  return (
    <View style={styles.screenWrapper}>
      {/* Scrollable Dashboard Body */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 25% Screen Height Hero Card directly below top navigation bar */}
        <View style={[styles.heroCard, { height: heroCardHeight }]}>
          <Image source={primaryBgAsset} style={styles.heroBgImage} resizeMode="cover" />
          <Text style={styles.heroMascot}>🐦</Text>
          <Text style={styles.heroTitle}>Chorpy</Text>
        </View>

        {/* Manage My Family Button auto-adjusting to 95% width directly below hero card */}
        <TouchableOpacity
          style={styles.manageFamilyBtn}
          onPress={onNavigateToFamily}
          accessibilityRole="button"
          accessibilityLabel="Manage My Family"
          activeOpacity={0.8}
        >
          <Text style={styles.manageFamilyText}>Manage My Family</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Floating Notification Cube sitting ON TOP OF EVERYTHING in top right */}
      <TouchableOpacity
        style={styles.notificationCube}
        accessibilityRole="button"
        accessibilityLabel="Notifications"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
        <View style={styles.badgeDot} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: colors.background,
    position: 'relative',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  heroCard: {
    width: '95%',
    alignSelf: 'center',
    marginTop: spacing.sm,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    position: 'relative',
  },
  heroBgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  heroMascot: {
    fontSize: 56,
    marginBottom: spacing.xs,
  },
  heroTitle: {
    fontSize: typography.fontSizes.display,
    fontFamily: typography.fontFamily.mainBold,
    color: colors.textLight,
    textAlign: 'center',
  },
  manageFamilyBtn: {
    width: '95%',
    alignSelf: 'center',
    minHeight: 48,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  manageFamilyText: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.secondaryBold,
    color: colors.textLight,
    textAlign: 'center',
  },
  notificationCube: {
    position: 'absolute',
    top: spacing.sm,
    right: '2.5%',
    zIndex: 20,
    width: 48,
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  badgeDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.danger,
  },
});
