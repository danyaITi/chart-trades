import {HTMLAttributes} from 'react';
import styles from './styles.module.scss';
import {classNames} from '@shared/utils';

type Props = HTMLAttributes<HTMLLIElement>;

export const MenuItem = ({children, className, ...props}: Props) => {
  return (
    <li {...props} className={classNames(styles.item, {}, [className])}>
      {children}
    </li>
  );
};
