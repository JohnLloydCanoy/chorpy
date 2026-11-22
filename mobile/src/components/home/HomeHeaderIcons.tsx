import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors, iconSizes } from '../../theme';

export interface HeaderIconProps {
  size?: number;
  color?: string;
}

/**
 * Native react-native-svg notification bell icon matching NavTabIcon 2px stroke style.
 */
export const NotificationBellIcon = React.memo(function NotificationBellIcon({
  size = iconSizes.lg,
  color = colors.primary,
}: HeaderIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Path
        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.73 21a2 2 0 0 1-3.46 0"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});

/**
 * Native react-native-svg 3-panel accordion-folded paper map location icon
 * with 2 interior vertical fold creases.
 */
export const FoldedMapIcon = React.memo(function FoldedMapIcon({
  size = iconSizes.lg,
  color = colors.primary,
}: HeaderIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Path
        d="M2 6v15l6.5-3.5 7 3.5 6.5-3.5V2.5L15.5 6l-7-3.5L2 6z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.5 2.5V17.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.5 6V21"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});

/**
 * Native react-native-svg clipboard/check task icon for notification rows.
 */
export const ChoreTaskIcon = React.memo(function ChoreTaskIcon({
  size = iconSizes.md,
  color = colors.primary,
}: HeaderIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Path
        d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 14l2 2 4-4"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});

/**
 * Subtle right chevron affordance for tappable chore rows.
 */
export const ChevronRightIcon = React.memo(function ChevronRightIcon({
  size = iconSizes.sm,
  color = colors.textMuted,
}: HeaderIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Path
        d="M9 6l6 6-6 6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});
