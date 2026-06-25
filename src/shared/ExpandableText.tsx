import React, { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ColorValue,
  type StyleProp,
  type TextLayoutEvent,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons/static';
import { colors } from '../styles/colors';
import { scaleSize } from '../styles/scale';
import { typography } from '../styles/typography';

type ExpandableTextProps = {
  text: string;
  collapsedLines: number;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  moreLabel?: string;
  lessLabel?: string;
};

const AVERAGE_CHARACTERS_PER_LINE = 48;

/*
 * Long biographies and summaries should never end with a dead ellipsis.
 *
 * React Native adds "..." when numberOfLines cuts text off, but that ellipsis
 * is only a drawing effect. It is not tappable and it does not automatically
 * reveal the hidden text. This component pairs the line clamp with an explicit
 * Show more / Show less control so truncated reading content has a real action.
 */
export function ExpandableText({
  text,
  collapsedLines,
  containerStyle,
  textStyle,
  moreLabel = 'Show more',
  lessLabel = 'Show less',
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasMeasuredOverflow, setHasMeasuredOverflow] = useState(false);

  const trimmedText = useMemo(() => text.trim(), [text]);
  const flattenedTextStyle = StyleSheet.flatten(textStyle);
  const toggleColor: ColorValue =
    flattenedTextStyle?.color ?? colors.textPrimary;
  const shouldOfferToggle =
    hasMeasuredOverflow ||
    trimmedText.length > collapsedLines * AVERAGE_CHARACTERS_PER_LINE;

  const handleTextLayout = useCallback(
    (event: TextLayoutEvent) => {
      if (event.nativeEvent.lines.length > collapsedLines) {
        setHasMeasuredOverflow(true);
      }
    },
    [collapsedLines]
  );

  if (!trimmedText) {
    return null;
  }

  return (
    <Pressable
      accessibilityRole={shouldOfferToggle ? 'button' : undefined}
      accessibilityLabel={
        shouldOfferToggle ? (isExpanded ? lessLabel : moreLabel) : undefined
      }
      disabled={!shouldOfferToggle}
      onPress={() => setIsExpanded(currentValue => !currentValue)}
      style={containerStyle}
    >
      <Text
        allowFontScaling={false}
        numberOfLines={isExpanded ? undefined : collapsedLines}
        onTextLayout={handleTextLayout}
        style={textStyle}
      >
        {trimmedText}
      </Text>

      {shouldOfferToggle ? (
        <View style={styles.toggleButton}>
          <Text
            allowFontScaling={false}
            style={[styles.toggleText, { color: toggleColor }]}
          >
            {isExpanded ? lessLabel : moreLabel}
          </Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={scaleSize(14)}
            color={toggleColor}
          />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggleButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(3),
    marginTop: scaleSize(4),
    paddingVertical: scaleSize(5),
  },
  toggleText: {
    ...typography.summaryBody,
    fontWeight: '400',
  },
});
