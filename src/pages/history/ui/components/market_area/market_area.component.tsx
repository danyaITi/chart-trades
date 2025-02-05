import BurgerMenuIcon from '@assets/images/burger-menu.svg?react';
import styles from './styles.module.scss';
import {useMenuHook} from '@shared/hooks';
import {Menu, MenuItem} from '@shared/components';
import {classNames} from '@shared/utils';
import BitcoinCurrencyIcon from '@assets/images/bitcoin-currency.svg?react';
import EthereumCurrencyIcon from '@assets/images/ethereum-currency.svg?react';
import SolanaCurrencyIcon from '@assets/images/solana-currency.svg?react';
import {MouseEvent} from 'react';

const CURRENCY: MenuType<CurrencyType>[] = [
  {
    icon: <BitcoinCurrencyIcon width={24} height={24} />,
    label: 'BTC',
    value: 'tBTCUSD',
  },
  {
    icon: <EthereumCurrencyIcon width={24} height={24} />,
    label: 'ETH',
    value: 'tETHUSD',
  },
  {
    icon: <SolanaCurrencyIcon width={24} height={24} />,
    label: 'SOL',
    value: 'tSOLUSD',
  },
];

type Props = {
  selectedCurrency: CurrencyType;
  setSelectedCurrency: (type: CurrencyType) => void;
};

export const MarketArea = ({selectedCurrency, setSelectedCurrency}: Props) => {
  const {handleMouseEnter, handleMouseLeave, isOpen, toggleMenu} = useMenuHook();

  const getItemFromSelectedCurrency = (target: 'icon' | 'label') => {
    const value = CURRENCY.find((chart) => chart.value === selectedCurrency);

    if (value) {
      return value[target];
    }
  };

  // Выбирает валюту
  const selectCurrencyHandler = (type: CurrencyType) => (event: MouseEvent) => {
    setSelectedCurrency(type);
    toggleMenu();

    event.stopPropagation();
  };

  return (
    <div className={styles.marketArea}>
      <div
        className={styles.marketCurrency}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={toggleMenu}>
        <BurgerMenuIcon />

        <Menu
          activeValue={getItemFromSelectedCurrency('icon')}
          classNameMenu={classNames(styles.menu, {[styles.open]: isOpen})}>
          {CURRENCY.map((item, index) => (
            <MenuItem
              key={index}
              className={classNames(styles.menuItem, {[styles.selected]: selectedCurrency === item.value})}
              onClick={selectCurrencyHandler(item.value)}>
              {item.icon}
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </div>

      <span className={styles.selectedCurrencyLabel}>{getItemFromSelectedCurrency('label')}/USDT</span>
    </div>
  );
};
