import {
  getLocalCalendarDate,
  isCurrentLocalCalendarDate,
} from '../src/utils/storage/localCalendarDate';

describe('local calendar date', () => {
  test('uses the device day instead of UTC late at night', () => {
    const lateEasternEvening = new Date('2026-08-25T23:30:00-04:00');

    expect(lateEasternEvening.toISOString().slice(0, 10)).toBe('2026-08-26');
    expect(getLocalCalendarDate(lateEasternEvening)).toBe('2026-08-25');
  });

  test('treats different times on the same local day as current', () => {
    expect(
      isCurrentLocalCalendarDate(
        '2026-08-25',
        new Date('2026-08-25T23:59:59-04:00'),
      ),
    ).toBe(true);
  });

  test('detects the next local day immediately after midnight', () => {
    expect(
      isCurrentLocalCalendarDate(
        '2026-08-25',
        new Date('2026-08-26T00:00:01-04:00'),
      ),
    ).toBe(false);
  });
});
