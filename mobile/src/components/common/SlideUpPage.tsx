import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  BackHandler,
  Easing,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, iconSizes, spacing, typography } from '../../theme';

export interface SlideUpPageProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  disableClose?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

const BackArrowIcon = React.memo(function BackArrowIcon() {
  return (
    <Svg
      width={iconSizes.lg}
      height={iconSizes.lg}
      viewBox="0 0 24 24"
      fill="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Path
        d="M19 12H5M12 19l-7-7 7-7"
        stroke={colors.primary}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});

export const SlideUpPage = React.memo(function SlideUpPage({
  visible,
  title,
  onClose,
  disableClose = false,
  children,
  footer,
}: SlideUpPageProps) {
  const { height: windowHeight } = useWindowDimensions();
  const slideDistance = Math.max(windowHeight, 600);

  const [rendered, setRendered] = useState(visible);
  const [reduceMotion, setReduceMotion] = useState(false);
  const translateY = useRef(new Animated.Value(visible ? 0 : slideDistance)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const visibleRef = useRef(visible);

  if (visible && !rendered) {
    setRendered(true);
  }

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
    visibleRef.current = visible;
    animRef.current?.stop();

    if (visible) {
      if (reduceMotion) {
        translateY.setValue(0);
        return;
      }
      translateY.setValue(slideDistance);
      const anim = Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      });
      animRef.current = anim;
      anim.start();
    } else if (rendered) {
      if (reduceMotion) {
        translateY.setValue(slideDistance);
        const instant = Animated.timing(translateY, {
          toValue: slideDistance,
          duration: 0,
          useNativeDriver: USE_NATIVE_DRIVER,
        });
        animRef.current = instant;
        instant.start(({ finished }) => {
          if (finished && !visibleRef.current) setRendered(false);
        });
        return;
      }
      const anim = Animated.timing(translateY, {
        toValue: slideDistance,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      });
      animRef.current = anim;
      anim.start(({ finished }) => {
        if (finished && !visibleRef.current) setRendered(false);
      });
    }
  }, [visible, rendered, reduceMotion, slideDistance, translateY]);

  useEffect(() => {
    if (!visible || Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!disableClose) onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, disableClose, onClose]);

  useEffect(() => {
    if (!visible || disableClose || Platform.OS !== 'web' || typeof window === 'undefined') return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, disableClose, onClose]);

  if (!rendered) return null;

  return (
    <Animated.View
      style={[styles.overlay, { transform: [{ translateY }] }]}
      accessibilityViewIsModal
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, disableClose && styles.backButtonDisabled]}
          onPress={onClose}
          disabled={disableClose}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Go back from ${title}`}
          accessibilityState={{ disabled: disableClose }}
        >
          <BackArrowIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flexFill}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.flexFill}>{children}</View>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.background,
    zIndex: 100,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.sm,
    minHeight: 56,
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonDisabled: {
    opacity: 0.45,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: typography.fontFamily.mainBold,
    fontSize: typography.fontSizes.lg,
    color: colors.primary,
  },
  headerSpacer: {
    width: 48,
  },
  flexFill: {
    flex: 1,
  },
  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
