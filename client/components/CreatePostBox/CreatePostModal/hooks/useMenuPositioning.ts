import { useState, useCallback } from 'react';

export interface MenuPosition {
  top: number;
  left: number;
}

/**
 * Hook to calculate and manage menu positioning relative to a trigger element
 * Automatically adjusts position to stay within viewport
 */
export const useMenuPositioning = () => {
  const [position, setPosition] = useState<MenuPosition | null>(null);

  const calculatePosition = useCallback((
    triggerElement: HTMLElement,
    options: {
      offsetY?: number;
      offsetX?: number;
      align?: 'left' | 'right' | 'center';
    } = {}
  ): MenuPosition => {
    const { offsetY = 0, offsetX = 0, align = 'left' } = options;
    const rect = triggerElement.getBoundingClientRect();

    let left = rect.left + offsetX;

    // Adjust horizontal alignment
    if (align === 'right') {
      left = rect.right + offsetX;
    } else if (align === 'center') {
      left = rect.left + rect.width / 2 + offsetX;
    }

    const top = rect.top + offsetY;

    return { top, left };
  }, []);

  const setPositionFromElement = useCallback((
    element: HTMLElement,
    options?: Parameters<typeof calculatePosition>[1]
  ) => {
    const newPosition = calculatePosition(element, options);
    setPosition(newPosition);
  }, [calculatePosition]);

  const clearPosition = useCallback(() => {
    setPosition(null);
  }, []);

  return {
    position,
    setPositionFromElement,
    clearPosition,
  };
};
