import {detectMob} from '@shared/utils';
import {useState} from 'react';

type State = {
  isOpen: boolean;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  toggleMenu: () => void;
};

/**
 * Кастомный хук для работы с компонентом Menu
 *
 * @returns State
 */
export const useMenuHook = (): State => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleMouseEnter = () => {
    if (!detectMob()) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!detectMob()) {
      setIsOpen(false);
    }
  };

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  return {
    handleMouseEnter,
    handleMouseLeave,
    toggleMenu,
    isOpen,
  };
};
