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
import {useEffect, useState} from 'react';
import {CandlestickData, UTCTimestamp} from 'lightweight-charts';
import {Button, Loader} from '@shared/components';
import {classNames} from '@shared/utils';

const url = 'wss://api-pub.bitfinex.com/ws/2';

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

/**
 * Страница мониторинга крипто-валют
 */
export const TradesPage = () => {
  const [selectedFrame, setSelectedFrame] = useState<TimeFrame>(TimeFrame['1MINUTE']);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const {ref, mainSeries} = useChart({
    backgroundColor: ChartBackgroundColor.DARK,
    autoSize: false,
    gridColor: ChartGridColor.SECONDARY,
    textColor: ChartTextColor.LIGHT,
    borderColor: ChartBorderColor.SECONDARY,
    upColor: ChartSeriesColor.UP,
    downColor: ChartSeriesColor.DOWN,
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
  }, [selectedFrame]);

  // Выбирает временные рамки для показа на графике
  const selectTimeHandler = (time: TimeFrame) => () => {
    setSelectedFrame(time);
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
      </div>
      <div className={styles.chartContainer} ref={ref}>
        {isLoading && (
          <span className={styles.loader}>
            <Loader />
          </span>
        )}
      </div>
    </div>
  );
};
