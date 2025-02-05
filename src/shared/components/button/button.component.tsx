import {ButtonHTMLAttributes, ForwardedRef, forwardRef} from 'react';
import styles from './styles.module.scss';

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef(({children, ...props}: Props, ref: ForwardedRef<HTMLButtonElement>) => {
  return (
    <button className={styles.button} {...props} ref={ref}>
      {children}
    </button>
  );
});
