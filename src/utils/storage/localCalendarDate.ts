function padCalendarPart(value: number) {
  return value.toString().padStart(2, '0');
}

/**
 * Build YYYY-MM-DD from the device's local calendar, not from UTC.
 *
 * Example: at 11:30 PM Eastern on August 25, toISOString() already says
 * August 26 because UTC is four hours ahead. Favorites and Seen must still
 * treat that visit as August 25, so this helper reads the device-local year,
 * month, and day separately.
 */
export function getLocalCalendarDate(date = new Date()) {
  return [
    date.getFullYear(),
    padCalendarPart(date.getMonth() + 1),
    padCalendarPart(date.getDate()),
  ].join('-');
}

export function isCurrentLocalCalendarDate(
  savedLocalDate: string | null,
  currentDate = new Date(),
) {
  return savedLocalDate === getLocalCalendarDate(currentDate);
}
