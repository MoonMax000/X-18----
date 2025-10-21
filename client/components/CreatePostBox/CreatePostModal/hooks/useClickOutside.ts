import { useEffect, RefObject } from 'react';

interface UseClickOutsideProps {
  ref: RefObject<HTMLElement>;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Hook to detect clicks outside of an element and trigger callback
 * Useful for closing dropdowns, menus, and popovers
 */
export const useClickOutside = ({ ref, isOpen, onClose }: UseClickOutsideProps) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, ref, onClose]);
};
