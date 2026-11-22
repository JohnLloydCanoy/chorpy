import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, iconSizes } from '../../theme';

export type NavIconScreen = 'home' | 'my_family' | 'settings';

export interface NavTabIconProps {
  screen: NavIconScreen;
  size?: number;
  color?: string;
}

/**
 * Semantic vector icons for Chorpy's main navigation tabs rendered via
 * react-native-svg for crisp scaling across Android, iOS, and Web.
 */
export const NavTabIcon = React.memo(function NavTabIcon({
  screen,
  size = iconSizes.md,
  color = colors.secondary,
}: NavTabIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {screen === 'home' ? (
        <>
          <Path
            d="M3 10.5L12 3l9 7.5"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M5 9.5V20a1 1 0 0 0 1 1h4.5v-6h3v6H18a1 1 0 0 0 1-1V9.5"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : null}

      {screen === 'my_family' ? (
        <>
          <Circle cx={9} cy={7.5} r={3} stroke={color} strokeWidth={2} />
          <Path
            d="M3 19.5v-1a4.5 4.5 0 0 1 4.5-4.5h3A4.5 4.5 0 0 1 15 18.5v1"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx={16.5} cy={8.5} r={2.25} stroke={color} strokeWidth={2} />
          <Path
            d="M17 14.25a3.75 3.75 0 0 1 4 3.75v1.5"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : null}

      {screen === 'settings' ? (
        <>
          <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={2} />
          <Path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.08a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.08a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : null}
    </Svg>
  );
});
