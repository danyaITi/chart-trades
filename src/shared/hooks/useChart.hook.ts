import {createChart, ISeriesApi, SeriesDataItemTypeMap, UTCTimestamp} from 'lightweight-charts';
import {MutableRefObject, useEffect, useRef} from 'react';
import {
  ChartBackgroundColor,
  ChartBorderColor,
  ChartGridColor,
  ChartSeriesColor,
  ChartTextColor,
} from '@shared/types/enums';
import {isOhlcData} from '@shared/types/guards';

type State = {
  ref: MutableRefObject<HTMLDivElement | null>;
  mainSeries: MutableRefObject<ISeriesApi<keyof SeriesDataItemTypeMap> | null>;
  legendRef: MutableRefObject<HTMLDivElement | null>;
};

type Props = {
  backgroundColor: ChartBackgroundColor;
  textColor: ChartTextColor;
  autoSize: boolean;
  gridColor: ChartGridColor;
  borderColor: ChartBorderColor;
  upColor: ChartSeriesColor;
  downColor: ChartSeriesColor;
  typeSeries?: keyof SeriesDataItemTypeMap;
  legend?: string;
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
 * @param [typeSeries] {ChartAvailableTypes} - тип графика
 * @param [legend] {string} - текст обозначение на графике
 * @example {
    backgroundColor: #000,
    autoSize: true,
    gridColor: #fef,
    textColor: #fff,
    typeSeries: 'Candlestick'
    ...,
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
  typeSeries = 'Candlestick',
  legend = '',
}: Props): State => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const legendRef = useRef<HTMLDivElement | null>(null);
  const mainSeries = useRef<ISeriesApi<keyof SeriesDataItemTypeMap> | null>(null);

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

    let series: ISeriesApi<keyof SeriesDataItemTypeMap> | null = null;

    if (typeSeries === 'Candlestick') {
      series = chart.addCandlestickSeries({
        upColor: upColor,
        downColor: downColor,
        borderVisible: false,
        wickUpColor: upColor,
        wickDownColor: downColor,
      });
    } else if (typeSeries === 'Bar') {
      series = chart.addBarSeries({
        upColor: upColor,
        downColor: downColor,
      });
    }

    mainSeries.current = series;

    // Текст обозначение при наведении на график
    if (legend) {
      chart.subscribeCrosshairMove((param) => {
        if (!param.point) {
          return;
        }

        if (param.time && series) {
          const data = param.seriesData.get(series);

          if (legendRef.current && isOhlcData(data)) {
            const isGreen = data?.close > data.open;

            legendRef.current.style.color = isGreen ? upColor : downColor;

            legendRef.current.innerHTML = `<span>${legend}</span>`;
          }
        }
      });
    }

    window.addEventListener('resize', handleResize);

    return () => {
      chart.remove();

      window.removeEventListener('resize', handleResize);
    };
  }, [typeSeries]);

  return {
    ref: chartContainerRef,
    mainSeries,
    legendRef,
  };
};
