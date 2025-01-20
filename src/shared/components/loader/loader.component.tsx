import {HTMLAttributes} from 'react';
import styles from './styles.module.scss';

type Props = HTMLAttributes<HTMLDivElement>;

export const Loader = ({...props}: Props) => {
  return <span className={styles.loader} {...props} />;
};
