import { useCallback, useState } from 'react';

/**
 * Keeps a filter's native Modal state and the page's gesture router in sync.
 * Every filter uses the same open/close path, so the page never has to guess
 * whether a popup currently owns scrolling.
 */
export function useFilterPopupVisibility(
  onPopupVisibilityChange: (isVisible: boolean) => void,
) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = useCallback(() => {
    onPopupVisibilityChange(true);
    setIsModalVisible(true);
  }, [onPopupVisibilityChange]);

  const hideModal = useCallback(() => {
    setIsModalVisible(false);
    onPopupVisibilityChange(false);
  }, [onPopupVisibilityChange]);

  return { hideModal, isModalVisible, showModal };
}
