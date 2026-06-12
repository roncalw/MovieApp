/**
 * Shared button design tokens.
 *
 * Imported by:
 * - Components that need app-level button colors without duplicating literals.
 *
 * Code flow:
 * 1. Button components read these tokens.
 * 2. Tokens read shared colors from src/styles/colors.ts.
 */
import { colors } from './colors';

export const buttons = {
  primaryPill: {
    backgroundColor: colors.chipBackgroundSelected,
    textColor: colors.actionOnPrimary,
  },
} as const;
