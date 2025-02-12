import {ButtonHTMLAttributes, ForwardedRef, forwardRef} from 'react';
import styles from './styles.module.scss';
import {classNames} from '@shared/utils';

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef(({children, className, ...props}: Props, ref: ForwardedRef<HTMLButtonElement>) => {
  return (
    <button className={classNames(styles.button, {}, [className])} {...props} ref={ref}>
      {children}
    </button>
  );
});
