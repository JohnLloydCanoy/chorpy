import React, { useCallback, useEffect, useRef } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../theme';

export interface WheelItem {
  label: string;
  value: number;
}

interface WheelColumnProps {
  items: readonly WheelItem[];
  selectedValue: number;
  onSelect: (value: number) => void;
  accessibilityLabel: string;
}

const ITEM_HEIGHT = 48;
const VISIBLE_ROWS = 3;
const COLUMN_HEIGHT = ITEM_HEIGHT * VISIBLE_ROWS;

interface WheelRowProps {
  item: WheelItem;
  isSelected: boolean;
  onPress: (value: number) => void;
}

const WheelRow = React.memo(function WheelRow({ item, isSelected, onPress }: WheelRowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => onPress(item.value)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={item.label}
    >
      <Text style={[styles.rowText, isSelected ? styles.rowTextSelected : null]} numberOfLines={1}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );
});

export const WheelColumn = React.memo(function WheelColumn({
  items,
  selectedValue,
  onSelect,
  accessibilityLabel,
}: WheelColumnProps) {
  const listRef = useRef<FlatList<WheelItem>>(null);
  const foundIndex = items.findIndex((item) => item.value === selectedValue);
  const selectedIndex = foundIndex >= 0 ? foundIndex : 0;

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: selectedIndex * ITEM_HEIGHT, animated: false });
  }, [selectedIndex]);

  const handleRowPress = useCallback(
    (value: number) => {
      onSelect(value);
      const nextIndex = items.findIndex((item) => item.value === value);
      if (nextIndex >= 0) {
        listRef.current?.scrollToOffset({ offset: nextIndex * ITEM_HEIGHT, animated: true });
      }
    },
    [items, onSelect]
  );

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const index = Math.max(0, Math.min(items.length - 1, Math.round(offsetY / ITEM_HEIGHT)));
      const snappedItem = items[index];
      if (snappedItem && snappedItem.value !== selectedValue) {
        onSelect(snappedItem.value);
      }
    },
    [items, onSelect, selectedValue]
  );

  const keyExtractor = useCallback((item: WheelItem) => String(item.value), []);

  const getItemLayout = useCallback(
    (_data: ArrayLike<WheelItem> | null | undefined, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<WheelItem>) => (
      <WheelRow item={item} isSelected={item.value === selectedValue} onPress={handleRowPress} />
    ),
    [handleRowPress, selectedValue]
  );

  return (
    <View style={styles.container} accessibilityLabel={accessibilityLabel}>
      <View style={styles.selectionBand} pointerEvents="none" />
      <FlatList
        ref={listRef}
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        initialScrollIndex={selectedIndex}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        onMomentumScrollEnd={handleMomentumScrollEnd}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, height: COLUMN_HEIGHT, overflow: 'hidden', position: 'relative' },
  selectionBand: { position: 'absolute', top: ITEM_HEIGHT, left: spacing.xs, right: spacing.xs, height: ITEM_HEIGHT, backgroundColor: colors.primarySoft, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: colors.border },
  listContent: { paddingVertical: ITEM_HEIGHT },
  row: { height: ITEM_HEIGHT, minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xs },
  rowText: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondaryMedium, color: colors.textSecondary },
  rowTextSelected: { fontSize: typography.fontSizes.base, fontFamily: typography.fontFamily.secondaryBold, color: colors.primary },
});
