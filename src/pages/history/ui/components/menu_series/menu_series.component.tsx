import {Menu, MenuItem} from '@shared/components';
import CandlestickChartIcon from '@assets/images/candlestick-chart.svg?react';
import BarChartIcon from '@assets/images/bar-chart.svg?react';
import {SeriesDataItemTypeMap} from 'lightweight-charts';
import {useMenuHook} from '@shared/hooks';
import {classNames} from '@shared/utils';
import styles from './styles.module.scss';

const SERIES: MenuType<keyof SeriesDataItemTypeMap>[] = [
  {
    icon: <CandlestickChartIcon width={24} height={24} />,
    label: 'Свечи',
    value: 'Candlestick',
  },
  {
    icon: <BarChartIcon width={24} height={24} />,
    label: 'Бары',
    value: 'Bar',
  },
];

type Props = {
  selectedSeries: keyof SeriesDataItemTypeMap;
  setSelectedSeries: (type: keyof SeriesDataItemTypeMap) => void;
};

export const MenuSeries = ({selectedSeries, setSelectedSeries}: Props) => {
  const {handleMouseEnter, handleMouseLeave, isOpen, toggleMenu} = useMenuHook();

  const getIconFromSelectedSeries = (target: 'icon') => {
    const value = SERIES.find((chart) => chart.value === selectedSeries);

    if (value) {
      return value[target];
    }
  };

  // Выбирает тип показываемого графика
  const selectTypeChartHandler = (value: keyof SeriesDataItemTypeMap) => () => {
    setSelectedSeries(value);
    toggleMenu();
  };

  return (
    <Menu
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onToggle={toggleMenu}
      activeValue={getIconFromSelectedSeries('icon')}
      classNameMenu={classNames(styles.menu, {[styles.open]: isOpen})}>
      {SERIES.map((item, index) => (
        <MenuItem
          key={index}
          className={classNames(styles.menuItem, {[styles.selected]: selectedSeries === item.value})}
          onClick={selectTypeChartHandler(item.value)}>
          {item.icon}
          {item.label}
        </MenuItem>
      ))}
    </Menu>
  );
};
