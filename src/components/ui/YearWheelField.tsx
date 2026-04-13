/*
Step: 6
   * /MovieApp/src/components/ui/YearWheelField.tsx
Imported by:
   * /MovieApp/src/components/header/SubHeaderMovieSearchFields.tsx
Next step path:
   * /MovieApp/src/screens/MovieSearchScreen.tsx
Purpose:
   * Renders a reusable year-only picker field that opens a one-column wheel modal for the movie search filters.
*/
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import WheelPicker from '@quidone/react-native-wheel-picker';
import { buttons } from '../../theme/buttons';
import { colors } from '../../theme/colors';
import { scaleSize } from '../../theme/scale';
import { typography } from '../../theme/typography';

type YearWheelFieldProps = {
  title: string;
  value: number;
  years: number[];
  onChange: (year: number) => void;
};

export function YearWheelField({
  title,
  value,
  years,
  onChange,
}: YearWheelFieldProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [draftYear, setDraftYear] = useState(value);

  const yearItems = useMemo(
    () =>
      years.map((year) => ({
        value: year,
        label: year.toString(),
      })),
    [years]
  );

  function openModal() {
    setDraftYear(value);
    setIsModalVisible(true);
  }

  function closeModal() {
    setDraftYear(value);
    setIsModalVisible(false);
  }

  function applySelection() {
    onChange(draftYear);
    setIsModalVisible(false);
  }

  return (
    <>
      <Pressable onPress={openModal} style={styles.field}>
        <Text allowFontScaling={false} style={styles.fieldValue}>
          {value}
        </Text>
        <Text allowFontScaling={false} style={styles.fieldChevron}>
          v
        </Text>
      </Pressable>

      <Modal
        transparent
        animationType="fade"
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={closeModal} />

          <View style={styles.modalCard}>
            <Text allowFontScaling={false} style={styles.modalTitle}>
              {title}
            </Text>

            <WheelPicker
              data={yearItems}
              value={draftYear}
              width="100%"
              itemHeight={scaleSize(44)}
              visibleItemCount={5}
              enableScrollByTapOnItem
              onValueChanged={({ item }) => setDraftYear(Number(item.value))}
              style={styles.wheel}
              itemTextStyle={styles.wheelItemText}
              overlayItemStyle={styles.wheelOverlay}
            />

            <View style={styles.actionsRow}>
              <Pressable onPress={closeModal} style={styles.secondaryAction}>
                <Text allowFontScaling={false} style={styles.secondaryActionText}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable onPress={applySelection} style={styles.primaryAction}>
                <Text allowFontScaling={false} style={styles.primaryActionText}>
                  Done
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: scaleSize(8),
    minHeight: scaleSize(44),
    paddingHorizontal: scaleSize(12),
    paddingVertical: scaleSize(10),
    backgroundColor: colors.background,
  },
  fieldValue: {
    ...typography.inputText,
    color: colors.textPrimary,
  },
  fieldChevron: {
    ...typography.inputText,
    color: colors.brandText,
  },
  modalRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scaleSize(20),
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.35)',
  },
  modalCard: {
    width: '100%',
    maxWidth: scaleSize(320),
    padding: scaleSize(16),
    borderRadius: scaleSize(16),
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  modalTitle: {
    ...typography.summaryTitle,
    color: colors.brandText,
    textAlign: 'center',
    marginBottom: scaleSize(12),
  },
  wheel: {
    width: '100%',
    alignSelf: 'center',
  },
  wheelItemText: {
    ...typography.pageTitle,
    color: colors.textPrimary,
  },
  wheelOverlay: {
    borderRadius: scaleSize(12),
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: scaleSize(10),
    marginTop: scaleSize(16),
  },
  secondaryAction: {
    minHeight: scaleSize(36),
    paddingHorizontal: scaleSize(14),
    paddingVertical: scaleSize(8),
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    ...typography.buttonLabel,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  primaryAction: {
    minHeight: scaleSize(36),
    paddingHorizontal: scaleSize(14),
    paddingVertical: scaleSize(8),
    borderRadius: 999,
    backgroundColor: buttons.primaryPill.backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    ...typography.buttonLabel,
    color: buttons.primaryPill.textColor,
    textAlign: 'center',
  },
});
