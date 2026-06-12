/**
 * Styles for the non-interactive MovieDetail information sections.
 *
 * Imported by:
 * - src/movie/components/MovieDetailInfoSections.tsx
 */
import { StyleSheet } from 'react-native';
import { colors } from '../colors';
import { scaleSize } from '../scale';

export const movieDetailInfoSectionStyles = StyleSheet.create({
  sectionLabel: {
    color: colors.textPrimary,
    fontSize: scaleSize(15),
    lineHeight: scaleSize(20),
    fontWeight: '700',
    letterSpacing: 0,
    marginTop: scaleSize(18),
    marginBottom: scaleSize(10),
    marginLeft: scaleSize(5),
  },
  infoPanel: {
    marginLeft: scaleSize(5),
    marginRight: scaleSize(5),
    padding: scaleSize(7),
    borderRadius: scaleSize(10),
    backgroundColor: colors.surfaceLight,
  },
  infoRow: {
    color: colors.textPrimary,
    fontSize: scaleSize(14),
    lineHeight: scaleSize(20),
    letterSpacing: 0,
    marginBottom: scaleSize(2),
  },
  infoLabel: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  watchProviderPanel: {
    marginLeft: scaleSize(5),
    marginRight: scaleSize(5),
    marginBottom: scaleSize(10),
    padding: scaleSize(7),
    borderRadius: scaleSize(10),
    backgroundColor: colors.surfaceLight,
  },
  watchProviderLabel: {
    color: colors.textPrimary,
    fontSize: scaleSize(14),
    lineHeight: scaleSize(20),
    letterSpacing: 0,
    marginBottom: scaleSize(2),
  },
  watchProviderRow: {
    minHeight: scaleSize(34),
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scaleSize(7),
  },
  watchProviderLogo: {
    width: scaleSize(30),
    height: scaleSize(30),
    borderRadius: scaleSize(5),
    backgroundColor: colors.surfaceWhite,
  },
  watchProviderName: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: scaleSize(14),
    lineHeight: scaleSize(20),
    letterSpacing: 0,
    marginLeft: scaleSize(10),
  },
  watchProviderUnavailable: {
    color: colors.textPrimary,
    fontSize: scaleSize(14),
    lineHeight: scaleSize(20),
    letterSpacing: 0,
  },
  companyRow: {
    minHeight: scaleSize(34),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaleSize(10),
  },
  companyLogo: {
    width: scaleSize(30),
    height: scaleSize(30),
    borderRadius: scaleSize(5),
    backgroundColor: colors.surfaceWhite,
  },
  companyName: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: scaleSize(14),
    lineHeight: scaleSize(20),
    letterSpacing: 0,
    marginLeft: scaleSize(10),
  },
  productionCountriesPanel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginLeft: scaleSize(5),
    marginRight: scaleSize(5),
    paddingVertical: scaleSize(7),
    paddingRight: scaleSize(10),
    borderRadius: scaleSize(10),
    backgroundColor: colors.surfaceLight,
  },
  productionCountry: {
    color: colors.textPrimary,
    fontSize: scaleSize(14),
    lineHeight: scaleSize(20),
    letterSpacing: 0,
    marginLeft: scaleSize(10),
  },
  footer: {
    alignItems: 'center',
    marginTop: scaleSize(40),
    marginBottom: scaleSize(50),
  },
  footerStrong: {
    color: colors.textPrimary,
    fontSize: scaleSize(14),
    lineHeight: scaleSize(20),
    fontWeight: '700',
    letterSpacing: 0,
  },
  footerText: {
    color: colors.textPrimary,
    fontSize: scaleSize(14),
    lineHeight: scaleSize(20),
    fontWeight: '400',
    letterSpacing: 0,
    marginTop: scaleSize(10),
  },
  footerLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
    paddingTop: scaleSize(10),
    paddingHorizontal: scaleSize(14),
  },
  tmdbLogo: {
    width: scaleSize(48),
    height: scaleSize(35),
  },
  justWatchLogo: {
    width: scaleSize(48),
    height: scaleSize(48),
    marginLeft: scaleSize(35),
  },
  footerImdbLogo: {
    width: scaleSize(70),
    height: scaleSize(35),
    marginTop: scaleSize(10),
  },
});
