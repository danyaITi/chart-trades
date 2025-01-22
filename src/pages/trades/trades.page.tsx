import {useChart} from '@shared/hooks';
import styles from './styles.module.scss';
import {
  ChartBackgroundColor,
  ChartBorderColor,
  ChartGridColor,
  ChartSeriesColor,
  ChartTextColor,
  TimeFrame,
} from '@shared/types/enums';
import {ReactElement, useCallback, useEffect, useState} from 'react';
import {CandlestickData, SeriesDataItemTypeMap, UTCTimestamp} from 'lightweight-charts';
import {Button, Legend, Loader, Menu, MenuItem} from '@shared/components';
import {classNames, detectMob} from '@shared/utils';
import CandlestickChartIcon from '@assets/images/candlestick-chart.svg?react';
import BarChartIcon from '@assets/images/bar-chart.svg?react';

const url = 'wss://api-pub.bitfinex.com/ws/2';

type ChartType = {
  icon: ReactElement<SVGElement>;
  label: string;
  type: keyof SeriesDataItemTypeMap;
};

const TIME_FRAMES: TimeFrame[] = [
  TimeFrame['1MINUTE'],
  TimeFrame['15MINUTE'],
  TimeFrame['30MINUTE'],
  TimeFrame['1HOUR'],
  TimeFrame['12HOUR'],
  TimeFrame['1DAY'],
  TimeFrame['1WEEK'],
  TimeFrame['1MONTH'],
];

const CHART_TYPES: ChartType[] = [
  {
    icon: <CandlestickChartIcon width={24} height={24} />,
    label: 'Свечи',
    type: 'Candlestick',
  },
  {
    icon: <BarChartIcon width={24} height={24} />,
    label: 'Бары',
    type: 'Bar',
  },
];

/**
 * Страница мониторинга крипто-валют
 */
export const TradesPage = () => {
  const [selectedFrame, setSelectedFrame] = useState<TimeFrame>(TimeFrame['1MINUTE']);
  const [selectedTypeChart, setSelectedTypeChart] = useState<keyof SeriesDataItemTypeMap>('Candlestick');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOpenMenu, setIsOpenMenu] = useState<boolean>(false);

  const {ref, mainSeries, legendRef} = useChart({
    backgroundColor: ChartBackgroundColor.DARK,
    autoSize: false,
    gridColor: ChartGridColor.SECONDARY,
    textColor: ChartTextColor.LIGHT,
    borderColor: ChartBorderColor.SECONDARY,
    upColor: ChartSeriesColor.UP,
    downColor: ChartSeriesColor.DOWN,
    typeSeries: selectedTypeChart,
    legend: 'Test',
  });

  useEffect(() => {
    const ws = new WebSocket(url);
    let heartbeatInterval: NodeJS.Timeout;
    let heartbeatTimeout: NodeJS.Timeout;

    setIsLoading(true);

    // Отправка ping
    const sendHeartbeat = () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({event: 'ping'}));
      }
    };

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          event: 'subscribe',
          channel: 'candles',
          key: `trade:${selectedFrame}:tBTCUSD`,
        }),
      );

      // Устанавливает интервал для heartbeat на 30 секунд
      heartbeatInterval = setInterval(sendHeartbeat, 30000);
    };

    ws.onmessage = (msg) => {
      const response = JSON.parse(msg.data);

      // Если сервер отвечает 'pong', сбрасывает тайм-аут
      if (response.event === 'pong') {
        clearTimeout(heartbeatTimeout);

        heartbeatTimeout = setTimeout(() => {
          // Закрывает соединение, если сервер не отвечает на пинг
          ws.close();
        }, 60000); // Ждет 60 секунд ответа
      }

      /**
       * Проверяет является ли ответ массивом и что второй элемент не строка 'hb'
       * @example [160000504, 'hb']
       */
      if (Array.isArray(response) && response[1] !== 'hb') {
        /**
         * Проверяет является ли ответ массивом массивов или масивом чисел
         * @example [[16000400, 99666, 95444, ...], [16000400, 99666, 95444, ...], [16000400, 99666, 95444, ...]]
         * или [16000400, 99666, 95444, ...]
         */
        if (!Array.isArray(response[1][0])) {
          const newCandle: CandlestickData = {
            time: (response[1][0] / 1000) as UTCTimestamp,
            open: response[1][1],
            high: response[1][3],
            low: response[1][4],
            close: response[1][2],
          };

          // Обновляет график при изменении стоимости валюты
          if (mainSeries.current) {
            mainSeries.current.update(newCandle);
          }
        } else {
          const candles: CandlestickData[] = response[1]
            .map((item: number[]) => {
              const candle: CandlestickData = {
                time: (item[0] / 1000) as UTCTimestamp,
                open: item[1],
                high: item[3],
                low: item[4],
                close: item[2],
              };

              return candle;
            })
            .sort((a: CandlestickData<UTCTimestamp>, b: CandlestickData<UTCTimestamp>) => a.time - b.time);

          // Устанавливает данные стоимости валюты при первом рендере
          if (mainSeries.current) {
            mainSeries.current.setData(candles);
            setIsLoading(false);
          }
        }
      }
    };

    ws.onerror = () => {
      setIsLoading(false);
    };

    ws.onclose = () => {
      clearInterval(heartbeatInterval);
      clearTimeout(heartbeatTimeout);
    };

    return () => {
      ws.close();
      clearInterval(heartbeatInterval);
      clearTimeout(heartbeatTimeout);
    };
  }, [selectedFrame, selectedTypeChart]);

  // Выбирает временные рамки для показа на графике
  const selectTimeHandler = (time: TimeFrame) => () => {
    setSelectedFrame(time);
  };

  // Выбирает тип показываемого графика
  const selectTypeChartHandler = (value: keyof SeriesDataItemTypeMap) => () => {
    setSelectedTypeChart(value);
    setIsOpenMenu(false);
  };

  const getSelectedTypeChartIcon = useCallback(() => {
    return CHART_TYPES.find((chart) => chart.type === selectedTypeChart)?.icon;
  }, [selectedTypeChart]);

  const handleMouseEnter = () => {
    if (!detectMob()) {
      setIsOpenMenu(true);
    }
  };

  const handleMouseLeave = () => {
    if (!detectMob()) {
      setIsOpenMenu(false);
    }
  };

  const toggleMenu = () => {
    if (detectMob()) {
      setIsOpenMenu((prev) => !prev);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.chartHeader}>
        <ul>
          {TIME_FRAMES.map((frame, index) => (
            <Button
              key={index}
              className={classNames(styles.timeFrameButton, {[styles.selectedFrame]: selectedFrame === frame})}
              onClick={selectTimeHandler(frame)}>
              {frame}
            </Button>
          ))}
        </ul>

        <span className={styles.hr} />

        <Menu
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClickButton={toggleMenu}
          activeValue={getSelectedTypeChartIcon()}
          classNameMenu={classNames(styles.menu, {[styles.open]: isOpenMenu})}>
          {CHART_TYPES.map((item, index) => (
            <MenuItem
              key={index}
              className={classNames(styles.menuItem, {[styles.selected]: selectedTypeChart === item.type})}
              onClick={selectTypeChartHandler(item.type)}>
              {item.icon}
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </div>

      <div className={styles.chartContainer} ref={ref}>
        <Legend ref={legendRef} className={styles.legend} />
        {isLoading && (
          <span className={styles.loader}>
            <Loader />
          </span>
        )}
      </div>
    </div>
  );
};
