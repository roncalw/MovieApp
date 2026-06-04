import { scaleSize } from '../../theme/scale';

export const HEADER_NAV_HORIZONTAL_OFFSET = scaleSize(20);
export const HEADER_NAV_TOP_OFFSET = scaleSize(20);
export const HEADER_NAV_SECONDARY_TOP_OFFSET =
  HEADER_NAV_TOP_OFFSET + scaleSize(42);
export const HEADER_NAV_BUTTON_SIZE = scaleSize(48);
export const HEADER_NAV_ICON_SIZE = scaleSize(30);
export const HEADER_NAV_BACK_ICON_SIZE = scaleSize(40);
export const HEADER_NAV_IMAGE_SIZE = scaleSize(48);

export function getHeaderNavTop(safeAreaTop: number) {
  return safeAreaTop + HEADER_NAV_TOP_OFFSET;
}

export function getHeaderNavSecondaryTop(safeAreaTop: number) {
  return safeAreaTop + HEADER_NAV_SECONDARY_TOP_OFFSET;
}
