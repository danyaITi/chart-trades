import {useChart} from '@shared/hooks';
import styles from './styles.module.scss';
import {
  ChartBackgroundColor,
  ChartBorderColor,
  ChartGridColor,
  ChartSeriesColor,
  ChartTextColor,
} from '@shared/types/enums';
import {useEffect} from 'react';
import {CandlestickData, UTCTimestamp} from 'lightweight-charts';

const url = 'wss://api-pub.bitfinex.com/ws/2';

/**
 * Страница мониторинга крипто-валют
 */
export const TradesPage = () => {
  const {ref, mainSeries} = useChart({
    backgroundColor: ChartBackgroundColor.DARK,
    autoSize: true,
    gridColor: ChartGridColor.SECONDARY,
    textColor: ChartTextColor.LIGHT,
    borderColor: ChartBorderColor.SECONDARY,
    upColor: ChartSeriesColor.UP,
    downColor: ChartSeriesColor.DOWN,
  });

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          event: 'subscribe',
          channel: 'candles',
          key: 'trade:1m:tBTCUSD',
        }),
      );
    };

    ws.onmessage = (msg) => {
      const response = JSON.parse(msg.data);

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
          }
        }
      }
    };

    ws.onerror = (error) => {
      throw error;
    };

    return () => {
      ws.close();
    };
  }, []);

  return <div className={styles.container} ref={ref} />;
};
