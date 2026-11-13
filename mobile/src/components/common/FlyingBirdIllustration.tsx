import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Polygon } from 'react-native-svg';
import { borderRadius, colors, spacing } from '../../theme';

function startCloudLoop(anim: Animated.Value, duration: number): Animated.CompositeAnimation {
  const loop = Animated.loop(
    Animated.sequence([
      Animated.timing(anim, { toValue: -170, duration, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 170, duration: 0, useNativeDriver: true }),
    ])
  );
  loop.start();
  return loop;
}

/**
 * Animated SVG mascot depicting Chorpy the Maya (Eurasian Tree Sparrow)
 * in a crisp Flappy-bird style flight loop with parallax cloud pills.
 */
export function FlyingBirdIllustration() {
  const [reduceMotion, setReduceMotion] = useState(false);

  const [flightProgress] = useState(() => new Animated.Value(0));
  const [wingProgress] = useState(() => new Animated.Value(0));
  const [upperCloudX] = useState(() => new Animated.Value(160));
  const [lowerCloudX] = useState(() => new Animated.Value(190));

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      flightProgress.setValue(0);
      wingProgress.setValue(0);
      upperCloudX.setValue(48);
      lowerCloudX.setValue(-56);
      return;
    }

    const flightLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(flightProgress, { toValue: 1, duration: 360, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(flightProgress, { toValue: 2, duration: 440, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.timing(flightProgress, { toValue: 0, duration: 240, easing: Easing.out(Easing.sin), useNativeDriver: true }),
      ])
    );
    const wingLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(wingProgress, { toValue: 1, duration: 180, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(wingProgress, { toValue: 0, duration: 180, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );

    flightLoop.start();
    wingLoop.start();
    const upperCloudLoop = startCloudLoop(upperCloudX, 2600);
    const lowerCloudLoop = startCloudLoop(lowerCloudX, 3600);

    return () => {
      flightLoop.stop();
      wingLoop.stop();
      upperCloudLoop.stop();
      lowerCloudLoop.stop();
    };
  }, [reduceMotion, flightProgress, wingProgress, upperCloudX, lowerCloudX]);

  const birdTranslateY = flightProgress.interpolate({ inputRange: [0, 1, 2], outputRange: [0, -12, 6] });
  const birdRotate = flightProgress.interpolate({ inputRange: [0, 1, 2], outputRange: ['0deg', '-8deg', '6deg'] });
  const wingRotate = wingProgress.interpolate({ inputRange: [0, 1], outputRange: ['-20deg', '24deg'] });

  return (
    <View style={styles.stage} accessible accessibilityRole="image" accessibilityLabel="Chorpy the Maya flying in the sky">
      <Animated.View style={[styles.cloudUpper, { transform: [{ translateX: upperCloudX }] }]} />
      <Animated.View style={[styles.cloudLower, { transform: [{ translateX: lowerCloudX }] }]} />

      <Animated.View style={[styles.birdRig, { transform: [{ translateY: birdTranslateY }, { rotate: birdRotate }] }]}>
        <Svg width={108} height={88} viewBox="0 0 108 88">
          <Polygon points="12,48 28,42 26,56 8,58" fill={colors.primaryDark} />
          <Polygon points="16,40 30,44 24,52 10,44" fill={colors.primary} />
          <Ellipse cx={54} cy={48} rx={27} ry={22} fill={colors.primary} />
          <Ellipse cx={59} cy={53} rx={17} ry={14} fill={colors.warningSoft} />
          <Path d="M44 58 Q58 64 72 56" stroke={colors.warning} strokeWidth={3} fill="none" />
          <Path d="M35 34 Q54 18 76 32 Q66 24 44 26 Z" fill={colors.primaryDark} />
          <Ellipse cx={64} cy={44} rx={8} ry={7} fill={colors.surface} />
          <Circle cx={63} cy={45} r={2.5} fill={colors.primary} />
          <Circle cx={71} cy={36} r={5.5} fill={colors.surface} />
          <Circle cx={72.5} cy={36} r={3} fill={colors.text} />
          <Circle cx={73.5} cy={34.8} r={1.1} fill={colors.surface} />
          <Polygon points="79,38 95,43 79,48" fill={colors.warning} />
          <Path d="M48 68 L44 76 M56 68 L53 76" stroke={colors.warning} strokeWidth={2.5} strokeLinecap="round" />
        </Svg>

        <Animated.View style={[styles.wingLayer, { transform: [{ rotate: wingRotate }] }]}>
          <Svg width={42} height={32} viewBox="0 0 42 32">
            <Path
              d="M6 12 Q24 2 36 14 Q28 28 8 24 Q2 18 6 12 Z"
              fill={colors.secondary}
              stroke={colors.primaryDark}
              strokeWidth={2}
            />
            <Path d="M12 15 Q22 10 30 16" stroke={colors.secondaryLight} strokeWidth={2.5} strokeLinecap="round" fill="none" />
          </Svg>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    width: 240,
    height: 148,
    backgroundColor: colors.secondarySoft,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  cloudUpper: {
    position: 'absolute',
    top: 22,
    width: 64,
    height: 20,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cloudLower: {
    position: 'absolute',
    bottom: 20,
    width: 52,
    height: 16,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  birdRig: { width: 108, height: 88, alignItems: 'center', justifyContent: 'center' },
  wingLayer: { position: 'absolute', left: 26, top: 32 },
});
