import {HTMLAttributes, ReactElement} from 'react';
import {Button} from '@shared/components';
import styles from './styles.module.scss';
import {classNames} from '@shared/utils';

type Props = HTMLAttributes<HTMLDivElement> & {
  onClickButton: () => void;
  activeValue?: ReactElement<SVGElement> | string;
  classNameMenu?: string;
};

/**
 * Выпадающее меню
 * @param HTMLDivElement
 * @param onClickButton {() => void} - обработчик для нажатия на кнопку
 * @param [activeValue] {ReactElement<SVGElement> | string} - текущий текст или икона в кнопке
 * @param [classNameList] {string} - дополнительные стили для выпадающего меню
 * 
 * @example 
 * <Menu
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClickButton={toggleMenu}
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
export const Menu = ({children, onClickButton, activeValue, classNameMenu, ...props}: Props) => {
  return (
    <div className={styles.menuContainer} {...props}>
      <Button className={styles.button} onClick={onClickButton}>
        {activeValue}
      </Button>
      <ul className={classNames(styles.menu, {}, [classNameMenu])}>{children}</ul>;
    </div>
  );
};
