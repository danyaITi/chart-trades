import {ForwardedRef, forwardRef, HTMLAttributes} from 'react';
import styles from './styles.module.scss';
import {classNames} from '@shared/utils';

type Props = HTMLAttributes<HTMLDivElement>;

export const Legend = forwardRef(({className, ...props}: Props, ref: ForwardedRef<HTMLDivElement | null>) => {
  return <div {...props} ref={ref} className={classNames(styles.legend, {}, [className])} />;
});
