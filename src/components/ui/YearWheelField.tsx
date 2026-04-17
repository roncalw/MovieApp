/*
Step: 6
   * /MovieApp/src/components/ui/YearWheelField.tsx
Imported by:
   * /MovieApp/src/components/header/SubHeaderMovieSearchFields.tsx
Next step path:
   * /MovieApp/src/screens/MovieSearchScreen.tsx
Purpose:
   * Renders a reusable year picker field for the movie search filters using the shared native date picker package.
*/
import React, { useMemo, useRef, useState } from 'react';
import DatePicker from 'react-native-date-picker';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { buttons } from '../../theme/buttons';
import { colors } from '../../theme/colors';
import { scaleSize } from '../../theme/scale';
import { typography } from '../../theme/typography';
import { getCurrentYear } from '../../utils/movieSearchDates';

type YearWheelFieldProps = {
  title: string;
  value: number;
  years: number[];
  onChange: (year: number) => void;
  variant?: 'default' | 'anchoredDate';
  dateRole?: 'begin' | 'end';
};

function buildDate(year: number, month: number, day: number) {
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

  return new Date(year, month, Math.min(day, lastDayOfMonth));
}

export function YearWheelField({
  title,
  value,
  years,
  onChange,
  variant = 'default',
  dateRole,
}: YearWheelFieldProps) {
  const today = useMemo(() => new Date(), []);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [anchoredModalTop, setAnchoredModalTop] = useState(scaleSize(96));
  const [anchoredModalLeft, setAnchoredModalLeft] = useState(scaleSize(16));
  const isAnchoredDate = variant === 'anchoredDate';
  const anchorRef = useRef<View>(null);
  const { width: windowWidth } = useWindowDimensions();
  const anchoredModalWidth = scaleSize(320);
  const anchoredPickerWidth = anchoredModalWidth - scaleSize(28);
  const minimumYear = useMemo(() => Math.min(...years), [years]);
  const maximumYear = useMemo(() => Math.max(...years), [years]);
  const minimumDate = useMemo(() => new Date(minimumYear, 0, 1), [minimumYear]);
  const maximumDate = useMemo(() => new Date(maximumYear, 11, 31), [maximumYear]);

  function getDisplayDateForYear(year: number) {
    if (dateRole === 'begin') {
      return new Date(year, 0, 1);
    }

    if (dateRole === 'end') {
      if (year >= getCurrentYear()) {
        return buildDate(year, today.getMonth(), today.getDate());
      }

      return new Date(year, 11, 31);
    }

    return new Date(year, 0, 1);
  }

  const [draftDate, setDraftDate] = useState(() => getDisplayDateForYear(value));
  const [anchoredOpenedDate, setAnchoredOpenedDate] = useState(() =>
    getDisplayDateForYear(value)
  );
  const pickerDate = useMemo(() => new Date(draftDate), [draftDate]);

  function openModal() {
    const initialDate = getDisplayDateForYear(value);
    setDraftDate(initialDate);
    setAnchoredOpenedDate(initialDate);

    if (!isAnchoredDate) {
      setIsModalVisible(true);
      return;
    }

    anchorRef.current?.measure((_, __, _width, height, _pageX, pageY) => {
      const horizontalPadding = scaleSize(16);
      const centeredLeft = (windowWidth - anchoredModalWidth) / 2;
      const nextLeft = Math.max(horizontalPadding, centeredLeft);
      const nextTop = Math.max(scaleSize(85), pageY + height - scaleSize(63));

      setAnchoredModalLeft(nextLeft);
      setAnchoredModalTop(nextTop);
      setIsModalVisible(true);
    });
  }

  function closeModal() {
    if (isAnchoredDate) {
      onChange(draftDate.getFullYear());
    }

    if (!isAnchoredDate) {
      setDraftDate(getDisplayDateForYear(value));
    }

    setIsModalVisible(false);
  }

  function applySelection() {
    onChange(draftDate.getFullYear());
    setIsModalVisible(false);
  }

  function cancelAnchoredSelection() {
    setDraftDate(anchoredOpenedDate);
    onChange(anchoredOpenedDate.getFullYear());
    setIsModalVisible(false);
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
                <DatePicker
                  date={pickerDate}
                  mode="date"
                  minimumDate={minimumDate}
                  maximumDate={maximumDate}
                  onDateChange={setDraftDate}
                  theme="light"
                  locale="en-US"
                  dividerColor="#000000"
                  style={[styles.anchoredDatePicker, { width: anchoredPickerWidth }]}
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

              <DatePicker
                date={pickerDate}
                mode="date"
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                onDateChange={setDraftDate}
                theme="light"
                locale="en-US"
                dividerColor="#000000"
                style={styles.modalDatePicker}
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
    backgroundColor: '#F8EBCE',
    borderColor: '#771F14',
    borderStartWidth: 3,
    borderEndWidth: 7,
    borderTopWidth: 1,
    borderBottomWidth: 5,
  },
  anchoredDatePicker: {
    height: scaleSize(180),
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
  modalDatePicker: {
    alignSelf: 'center',
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
