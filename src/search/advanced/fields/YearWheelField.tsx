/*
Step: 6
   * /MovieApp/src/search/advanced/fields/YearWheelField.tsx
Imported by:
   * /MovieApp/src/search/advanced/SubHeaderMovieSearchFields.tsx
Next step path:
   * /MovieApp/src/search/advanced/MovieSearchScreen.tsx
Purpose:
   * Renders a reusable year picker field for the movie search filters using the shared native date picker package.
*/
import React, { useMemo, useRef, useState } from 'react';
import DatePicker from 'react-native-date-picker';
import {
  Modal,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { scaleSize } from '../../../theme/scale';
import { colors } from '../../../styles/colors';
import { yearWheelFieldStyles as styles } from '../../../styles/search/yearWheelFieldStyles';
import { getCurrentYear } from '../../../utils/movieSearchDates';
import type { YearWheelFieldProps } from '../../../types/search/movieSearchFieldTypes';

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
                  dividerColor={colors.pickerDivider}
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
                dividerColor={colors.pickerDivider}
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
