import {ButtonHTMLAttributes} from 'react';
import styles from './styles.module.scss';

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({children}: Props) => {
  return <button className={styles.button}>{children}</button>;
};
