# Year Wheel Plan

## Package
- Install with npm: [`@quidone/react-native-wheel-picker`](https://www.npmjs.com/package/@quidone/react-native-wheel-picker)
- Source / docs: [GitHub repo](https://github.com/quidone/react-native-wheel-picker)

## Install Steps
1. Open a terminal in the repo root:
   [MovieApp](/Users/croncallo/repo/MovieApp)

2. Install the package:

   ```bash
   npm install @quidone/react-native-wheel-picker
   ```

3. Restart Metro so the new package is picked up cleanly:

   ```bash
   npm run start-reset
   ```

4. Reopen the app on device after Metro is back up.

## Implementation Steps
1. Keep [MovieSearchScreen.tsx](/Users/croncallo/repo/MovieApp/src/screens/MovieSearchScreen.tsx) as the page composer only.
   It should keep owning only the submitted query params and the query hook.

2. Keep all draft filter state in [MovieSearchHeader.tsx](/Users/croncallo/repo/MovieApp/src/components/MovieSearchHeader.tsx).
   That includes `beginYear`, `endYear`, and the rest of the in-progress filter choices.

3. Replace the two text date inputs with two tappable year fields:
   - `Begin Year`
   - `End Year`

4. Add one reusable component:
   [YearWheelField.tsx](/Users/croncallo/repo/MovieApp/src/components/YearWheelField.tsx)

   It should:
   - render the visible field
   - open a modal
   - show a single-column year wheel
   - support cancel / done
   - return the selected year

5. Build a year list once.

   Rules:
   - max year = current year
   - no future years
   - min year = likely `1960` unless we choose another floor

6. Keep selected values as years inside `MovieSearchHeader`.

   Defaults:
   - begin year = current year minus 5
   - end year = current year

7. Convert years into real query dates only when `Submit` is pressed.

   Business rules:
   - begin year `YYYY` -> `YYYY-01-01`
   - end year `YYYY`
     - if it is the current year -> today's date
     - otherwise -> `YYYY-12-31`

8. Pass one final submitted payload up from `MovieSearchHeader` to `MovieSearchScreen`.
   That payload should include the derived `beginDate` and `endDate`.

9. Let `MovieSearchScreen` store only the applied query params and run the query from those.

10. Keep the current submit-only behavior unchanged.
    No search should run when the wheel changes, only when `Submit` is tapped.

11. Show the derived real dates in the summary.

    Example:
    - `Begin Date: 2021-01-01`
    - `End Date: 2026-04-11`

## Architecture Reminder
- `MovieSearchHeader` owns all draft filter interaction
- `MovieSearchScreen` owns only submitted query state
- `YearWheelField` stays reusable and focused
- the API still receives real dates, not just years
