import {useChart} from '@shared/hooks';
import styles from './styles.module.scss';
import {
  ChartBackgroundColor,
  ChartBorderColor,
  ChartGridColor,
  ChartSeriesColor,
  ChartTextColor,
} from '@shared/models/enums';
import {useEffect, useState} from 'react';
import {CandlestickData, SeriesDataItemTypeMap, UTCTimestamp} from 'lightweight-charts';
import {Legend, Loader} from '@shared/components';

import {MarketArea, MenuSeries, TimeFrames} from '@pages/history/ui';
import {TimeFrame} from '@pages/history/models';
import {getDataSessionStorage, logger, sessionStorageKey, setDataSessionStorage} from '@shared/utils';

const url = 'wss://api-pub.bitfinex.com/ws/2';

type DataForSave = {
  selectedTimeFrame: TimeFrame;
  selectedSeries: keyof SeriesDataItemTypeMap;
  selectedCurrency: CurrencyType;
};

/**
 * Страница мониторинга истории курса крипто-валют
 */
export const HistoryPage = () => {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>(
    getDataSessionStorage<DataForSave>(sessionStorageKey.chartHistoryPage)?.selectedTimeFrame ?? TimeFrame['1MINUTE'],
  );
  const [selectedSeries, setSelectedSeries] = useState<keyof SeriesDataItemTypeMap>(
    getDataSessionStorage<DataForSave>(sessionStorageKey.chartHistoryPage)?.selectedSeries ?? 'Candlestick',
  );
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>(
    getDataSessionStorage<DataForSave>(sessionStorageKey.chartHistoryPage)?.selectedCurrency ?? 'tBTCUSD',
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const {ref, mainSeries, legendRef} = useChart({
    backgroundColor: ChartBackgroundColor.DARK,
    autoSize: false,
    gridColor: ChartGridColor.SECONDARY,
    textColor: ChartTextColor.LIGHT,
    borderColor: ChartBorderColor.SECONDARY,
    upColor: ChartSeriesColor.UP,
    downColor: ChartSeriesColor.DOWN,
    typeSeries: selectedSeries,
    hasLegend: true,
    additionalLegendText: `${selectedCurrency} ${selectedTimeFrame}`,
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
          key: `trade:${selectedTimeFrame}:${selectedCurrency}`,
        }),
      );

      // После установки соединения, сохраняет параметры в локальное хранилище
      setDataSessionStorage(sessionStorageKey.chartHistoryPage, {
        selectedTimeFrame,
        selectedSeries,
        selectedCurrency,
      });

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
            try {
              mainSeries.current.update(newCandle);
            } catch (error) {
              logger.warn('', error);
              return;
            }
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
  }, [selectedTimeFrame, selectedSeries, selectedCurrency]);

  return (
    <div className={styles.container}>
      <MarketArea selectedCurrency={selectedCurrency} setSelectedCurrency={setSelectedCurrency} />
      <div className={styles.chartHeader}>
        <TimeFrames selectedTimeFrame={selectedTimeFrame} setSelectedTimeFrame={setSelectedTimeFrame} />

        <span className={styles.hr} />

        <MenuSeries selectedSeries={selectedSeries} setSelectedSeries={setSelectedSeries} />
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
