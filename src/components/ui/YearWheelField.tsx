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
import React, { useMemo, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
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
  variant?: 'default' | 'anchoredDate';
};

export function YearWheelField({
  title,
  value,
  years,
  onChange,
  variant = 'default',
}: YearWheelFieldProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [draftYear, setDraftYear] = useState(value);
  const [anchoredOpenedYear, setAnchoredOpenedYear] = useState(value);
  const [anchoredModalTop, setAnchoredModalTop] = useState(scaleSize(96));
  const [anchoredModalLeft, setAnchoredModalLeft] = useState(scaleSize(16));
  const isAnchoredDate = variant === 'anchoredDate';
  const anchorRef = useRef<View>(null);
  const { width: windowWidth } = useWindowDimensions();
  const anchoredModalWidth = scaleSize(210);

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
    setAnchoredOpenedYear(value);

    if (!isAnchoredDate) {
      setIsModalVisible(true);
      return;
    }

    anchorRef.current?.measure((_, __, width, height, pageX, pageY) => {
      const horizontalPadding = scaleSize(16);
      const desiredLeft = pageX + width / 2 - anchoredModalWidth / 2;
      const nextLeft = Math.min(
        Math.max(horizontalPadding, desiredLeft),
        windowWidth - anchoredModalWidth - horizontalPadding
      );
      const nextTop = Math.max(scaleSize(105), pageY + height - scaleSize(43));

      setAnchoredModalLeft(nextLeft);
      setAnchoredModalTop(nextTop);
      setIsModalVisible(true);
    });
  }

  function closeModal() {
    if (isAnchoredDate) {
      onChange(draftYear);
    }

    if (!isAnchoredDate) {
      setDraftYear(value);
    }

    setIsModalVisible(false);
  }

  function cancelAnchoredSelection() {
    setDraftYear(anchoredOpenedYear);
    onChange(anchoredOpenedYear);
    setIsModalVisible(false);
  }

  function applySelection() {
    onChange(draftYear);
    setIsModalVisible(false);
  }

  function handleAnchoredValueChanging(nextYear: number) {
    setDraftYear(nextYear);
  }

  function handleAnchoredValueChanged(nextYear: number) {
    setDraftYear(nextYear);
    onChange(nextYear);
  }

  return (
    <>
      <View ref={anchorRef} collapsable={false}>
        <Pressable
          onPress={openModal}
          style={[styles.field, isAnchoredDate && styles.anchoredDateField]}
        >
          <Text
            allowFontScaling={false}
            style={[styles.fieldValue, isAnchoredDate && styles.anchoredDateFieldValue]}
          >
            {value}
          </Text>
          {isAnchoredDate ? null : (
            <Text allowFontScaling={false} style={styles.fieldChevron}>
              v
            </Text>
          )}
        </Pressable>
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={[styles.backdrop, isAnchoredDate && styles.anchoredDateBackdrop]}
            onPress={closeModal}
          />

          {isAnchoredDate ? (
            <View
              style={[
                styles.anchoredDateModalAnchor,
                {
                  top: anchoredModalTop,
                  left: anchoredModalLeft,
                  width: anchoredModalWidth,
                },
              ]}
            >
              <View style={styles.anchoredDateModalCard}>
                <WheelPicker
                  data={yearItems}
                  value={draftYear}
                  width="100%"
                  itemHeight={scaleSize(42)}
                  visibleItemCount={3}
                  enableScrollByTapOnItem
                  onValueChanging={({ item }) =>
                    handleAnchoredValueChanging(Number(item.value))
                  }
                  onValueChanged={({ item }) =>
                    handleAnchoredValueChanged(Number(item.value))
                  }
                  style={styles.anchoredDateWheel}
                  itemTextStyle={styles.anchoredDateWheelItemText}
                  overlayItemStyle={styles.anchoredDateWheelOverlay}
                  renderItem={({ item, itemTextStyle }) => (
                    <Text
                      allowFontScaling={false}
                      style={[
                        itemTextStyle,
                        styles.anchoredDateWheelText,
                        item.value === draftYear && styles.anchoredDateWheelTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  )}
                />
              </View>

              <View style={styles.anchoredDateActionsRow}>
                <Pressable
                  onPress={cancelAnchoredSelection}
                  style={styles.anchoredDateSecondaryButton}
                >
                  <Text
                    allowFontScaling={false}
                    style={styles.anchoredDateSecondaryButtonText}
                  >
                    Cancel
                  </Text>
                </Pressable>

                <Pressable onPress={closeModal} style={styles.anchoredDateCloseButton}>
                  <Text allowFontScaling={false} style={styles.anchoredDateCloseButtonText}>
                    Close
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
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
          )}
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
  anchoredDateField: {
    width: scaleSize(120),
    minHeight: scaleSize(40),
    paddingHorizontal: scaleSize(10),
    paddingVertical: 0,
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#F8EBCE',
    borderWidth: 0,
    borderColor: '#771F14',
    borderRadius: scaleSize(10),
    borderStartWidth: 2,
    borderEndWidth: 3,
    borderTopWidth: 1,
    borderBottomWidth: 2.5,
  },
  anchoredDateFieldValue: {
    color: colors.textPrimary,
    textAlign: 'center',
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
  anchoredDateBackdrop: {
    backgroundColor: 'transparent',
  },
  anchoredDateModalAnchor: {
    position: 'absolute',
    alignItems: 'center',
  },
  anchoredDateModalCard: {
    width: '100%',
    paddingHorizontal: scaleSize(14),
    paddingVertical: scaleSize(10),
    borderRadius: scaleSize(30),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#771F14',
    borderColor: '#59170F',
    borderStartWidth: 3,
    borderEndWidth: 7,
    borderTopWidth: 1,
    borderBottomWidth: 5,
  },
  anchoredDateWheel: {
    width: '100%',
    alignSelf: 'center',
  },
  anchoredDateWheelItemText: {
    fontSize: scaleSize(30),
    lineHeight: scaleSize(36),
    fontWeight: '400',
  },
  anchoredDateWheelText: {
    color: '#F0D0CB',
    textAlign: 'center',
  },
  anchoredDateWheelTextActive: {
    color: '#FFF8F6',
  },
  anchoredDateWheelOverlay: {
    borderRadius: scaleSize(16),
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 0,
  },
  anchoredDateActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaleSize(10),
    marginTop: scaleSize(10),
  },
  anchoredDateCloseButton: {
    width: scaleSize(96),
    minHeight: scaleSize(40),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8EBCE',
    borderRadius: scaleSize(10),
    borderWidth: 0,
    borderColor: '#771F14',
    borderStartWidth: 2,
    borderEndWidth: 3,
    borderTopWidth: 1,
    borderBottomWidth: 2.5,
  },
  anchoredDateSecondaryButton: {
    width: scaleSize(96),
    minHeight: scaleSize(40),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8EBCE',
    borderRadius: scaleSize(10),
    borderWidth: 0,
    borderColor: '#771F14',
    borderStartWidth: 2,
    borderEndWidth: 3,
    borderTopWidth: 1,
    borderBottomWidth: 2.5,
  },
  anchoredDateSecondaryButtonText: {
    color: colors.textPrimary,
    fontSize: scaleSize(16),
    lineHeight: scaleSize(20),
    textAlign: 'center',
  },
  anchoredDateCloseButtonText: {
    color: colors.textPrimary,
    fontSize: scaleSize(16),
    lineHeight: scaleSize(20),
    textAlign: 'center',
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
