import {HTMLAttributes, ReactElement} from 'react';
import {Button} from '@shared/components';
import styles from './styles.module.scss';
import {classNames} from '@shared/utils';

type Props = HTMLAttributes<HTMLDivElement> & {
  onToggle?: () => void;
  activeValue?: ReactElement<SVGElement> | string;
  classNameMenu?: string;
};

/**
 * Выпадающее меню
 * 
 * @param HTMLDivElement
 * @param [onToggle] {() => void} - открывает/закрывает меню
 * @param [activeValue] {ReactElement<SVGElement> | string} - текущий текст или икона в кнопке
 * @param [classNameMenu] {string} - дополнительные стили для выпадающего меню
 * 
 * @example 
 * <Menu
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onToggle={toggleMenu}
      activeValue={value}
      classNameMenu={classNames(styles.menu, {[styles.open]: isOpenMenu})}>
      {array.map((text) => (
        <MenuItem
          className={styles.menuItem}>
          {text}
        </MenuItem>
      ))}
    </Menu>
 */
export const Menu = ({children, onToggle, activeValue, classNameMenu, ...props}: Props) => {
  return (
    <div className={styles.menuContainer} {...props}>
      <Button className={styles.button} onClick={onToggle}>
        {activeValue}
      </Button>
      <ul className={classNames(styles.menu, {}, [classNameMenu])}>{children}</ul>;
    </div>
  );
};
