/**
 * Shared color tokens for MovieApp.
 *
 * Imported by:
 * - Screen, component, and style modules throughout src.
 *
 * Code flow:
 * 1. Components import named colors instead of hard-coding hex/rgb values.
 * 2. Feature style files combine these tokens with scale/typography tokens.
 * 3. Legacy src/theme/colors.ts re-exports this file until all imports move here.
 */
export const colors = {
  background: '#fff',
  brandText: 'rgb(127, 29, 29)',
  drawerActiveText: 'rgb(127, 29, 29)',
  drawerInactiveText: 'rgb(127, 29, 29)',
  drawerActiveIcon: 'rgb(127, 29, 29)',
  drawerInactiveIcon: 'rgb(127, 29, 29)',
  drawerSecondaryActiveText: 'rgb(127, 29, 29)',
  drawerSecondaryInactiveText: 'rgb(127, 29, 29)',
  drawerSecondaryActiveIcon: 'rgb(127, 29, 29)',
  drawerSecondaryInactiveIcon: 'rgb(127, 29, 29)',
  textPrimary: '#111827',
  textSecondary: '#444',
  actionPrimary: '#111827',
  actionOnPrimary: '#fff',
  switchInactive: 'grey',
  switchThumb: '#FFFFFF',
  chipBorder: '#68A1ED',
  chipBackgroundSelected: '#68A1ED',
  actionLink: '#007BFF',
  surfaceMuted: '#f4f6f8',
  surfaceLight: '#eeeeee',
  surfaceWhite: '#ffffff',
  drawerHeaderBackground: '#A6A6A6',
  drawerActiveBackground: '#EEEEEE',
  borderSubtle: '#ddd',
  disabledText: '#8C8C8C',
  favoriteActive: 'red',
  brandTextLight: 'rgb(158, 58, 58)',
  brandTintSurface: '#F8EBCE',
  trailerPlayBackground: '#4481FC',
  starFilled: 'gold',
  movieBackButton: '#800000',
  movieShadow: '#4F4F4F',
  overlayLight: 'rgba(255, 255, 255, 0.75)',
  overlayDark: 'rgba(0, 0, 0, 0.78)',
  placeholderAccent: 'rgba(220, 38, 38, 0.35)',
  borderDefault: '#ccc',
  modalBackdrop: 'rgba(17, 24, 39, 0.35)',
  pickerDivider: '#000000',
  searchAccent: '#771F14',
  searchMutedText: '#777777',
  searchModalSurface: 'rgba(251, 235, 202, 0.999)',
  searchChipSurface: '#D9BC84',
  searchChipBorderSubtle: 'rgba(119, 31, 20, 0.12)',
  searchChipBorderSubtleSelected: 'rgba(119, 31, 20, 0.18)',
} as const;
