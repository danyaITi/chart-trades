import {createChart, ISeriesApi, UTCTimestamp} from 'lightweight-charts';
import {MutableRefObject, useEffect, useRef} from 'react';
import {
  ChartBackgroundColor,
  ChartBorderColor,
  ChartGridColor,
  ChartSeriesColor,
  ChartTextColor,
} from '@shared/types/enums';

type State = {
  ref: MutableRefObject<HTMLDivElement | null>;
};

type Props = {
  backgroundColor: ChartBackgroundColor;
  textColor: ChartTextColor;
  autoSize: boolean;
  gridColor: ChartGridColor;
  borderColor: ChartBorderColor;
  upColor: ChartSeriesColor;
  downColor: ChartSeriesColor;
};

/**
 * Хук для получения графика
 *
 * @param backgroundColor {ChartBackgroundColor} - цвет фона графика
 * @param textColor {ChartTextColor} - цвет текста графика
 * @param autoSize {boolean} - растягивает график на всю площадь контейнера
 * @param gridColor {ChartGridColor} - цвет сетки графика
 * @param borderColor {ChartBackgroundColor} - цвет границ графика
 * @param downColor {ChartBackgroundColor} - цвет снижения графика
 * @param upColor {ChartBackgroundColor} - цвет повышения графика
 * @example {
    backgroundColor: ChartBackgroundColor.DARK,
    autoSize: true,
    gridColor: ChartGridColor.SECONDARY,
    textColor: ChartTextColor.LIGHT,
    borderColor: ChartBorderColor.SECONDARY,
    upColor: ChartSeriesColor.UP,
    downColor: ChartSeriesColor.DOWN,
  }
 */
export const useChart = ({
  backgroundColor,
  textColor,
  autoSize,
  gridColor,
  borderColor,
  downColor,
  upColor,
}: Props): State => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const mainSeries = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    const handleResize = () => {
      chart.applyOptions({width: chartContainerRef.current?.clientWidth});
    };

    const chart = createChart(chartContainerRef.current as HTMLElement, {
      layout: {
        background: {color: backgroundColor},
        textColor,
        attributionLogo: false,
      },
      grid: {
        vertLines: {color: gridColor},
        horzLines: {color: gridColor},
      },
      autoSize,
    });
    chart.timeScale().scrollToPosition(5, true);
    chart.timeScale().fitContent();

    const currentLocale = window.navigator.languages[0];

    const myPriceFormatter = Intl.NumberFormat(currentLocale, {
      style: 'currency',
      currency: 'USD',
    }).format;

    chart.applyOptions({
      localization: {
        priceFormatter: myPriceFormatter,
        timeFormatter: (businessDayOrTimestamp: UTCTimestamp) => {
          const date = new Date(businessDayOrTimestamp * 1000);

          const options: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: 'short',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          };

          return new Intl.DateTimeFormat(navigator.language, options).format(date);
        },
      },
    });

    chart.timeScale().applyOptions({
      borderColor,
    });

    const series = chart.addCandlestickSeries({
      upColor: upColor,
      downColor: downColor,
      borderVisible: false,
      wickUpColor: upColor,
      wickDownColor: downColor,
    });

    mainSeries.current = series;

    mainSeries.current.setData([
      {open: 10, high: 10.63, low: 9.49, close: 9.55, time: 1642427876 as UTCTimestamp},
      {open: 9.55, high: 10.3, low: 9.42, close: 9.94, time: 1642514276 as UTCTimestamp},
      {open: 9.94, high: 10.17, low: 9.92, close: 9.78, time: 1642600676 as UTCTimestamp},
      {open: 9.78, high: 10.59, low: 9.18, close: 9.51, time: 1642687076 as UTCTimestamp},
      {open: 9.51, high: 10.46, low: 9.1, close: 10.17, time: 1642773476 as UTCTimestamp},
      {open: 10.17, high: 10.96, low: 10.16, close: 10.47, time: 1642859876 as UTCTimestamp},
      {open: 10.47, high: 11.39, low: 10.4, close: 10.81, time: 1642946276 as UTCTimestamp},
      {open: 10.81, high: 11.6, low: 10.3, close: 10.75, time: 1643032676 as UTCTimestamp},
      {open: 10.75, high: 11.6, low: 10.49, close: 10.93, time: 1643119076 as UTCTimestamp},
      {open: 10.93, high: 11.53, low: 10.76, close: 10.96, time: 1643205476 as UTCTimestamp},
    ]);

    window.addEventListener('resize', handleResize);

    return () => {
      chart.remove();

      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return {
    ref: chartContainerRef,
  };
};
