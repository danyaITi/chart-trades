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
  mainSeries: MutableRefObject<ISeriesApi<ChartAvailableTypes> | null>;
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

    window.addEventListener('resize', handleResize);

    return () => {
      chart.remove();

      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return {
    ref: chartContainerRef,
    mainSeries,
  };
};
