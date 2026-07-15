/**
 * Standard header for pages reached from the navigation drawer.
 *
 * The component owns the shared height, title alignment, and left navigation
 * button. A page still supplies the button action because opening the drawer
 * and returning from a child page are different navigation decisions.
 */
import React, { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { scaleSize } from '../../theme/scale';
import { typography } from '../../theme/typography';
import { HeaderActionRow } from './HeaderActionRow';
import { HeaderNavButton } from './HeaderNavButton';

type DrawerScreenHeaderProps = {
  title: string;
  leftButtonVariant: 'menu' | 'back';
  onLeftButtonPress: () => void;
  right?: ReactNode;
  titleVariant?: 'standard' | 'prominent';
};

export function DrawerScreenHeader({
  title,
  leftButtonVariant,
  onLeftButtonPress,
  right,
  titleVariant = 'standard',
}: DrawerScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <HeaderActionRow
        left={
          <HeaderNavButton
            variant={leftButtonVariant}
            anchored={false}
            onPress={onLeftButtonPress}
          />
        }
        center={
          <Text
            allowFontScaling={false}
            adjustsFontSizeToFit
            numberOfLines={1}
            style={[
              styles.title,
              titleVariant === 'prominent' ? styles.prominentTitle : null,
            ]}
          >
            {title}
          </Text>
        }
        right={right}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: scaleSize(142),
    backgroundColor: colors.background,
  },
  title: {
    width: '100%',
    fontSize: scaleSize(22),
    lineHeight: scaleSize(28),
    fontWeight: '400',
    letterSpacing: 0,
    color: colors.brandText,
    textAlign: 'center',
  },
  prominentTitle: {
    ...typography.pageTitle,
  },
});
