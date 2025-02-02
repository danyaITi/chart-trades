import {createChart, ISeriesApi, SeriesDataItemTypeMap, UTCTimestamp} from 'lightweight-charts';
import {MutableRefObject, useEffect, useRef} from 'react';
import {
  ChartBackgroundColor,
  ChartBorderColor,
  ChartGridColor,
  ChartSeriesColor,
  ChartTextColor,
} from '@shared/models/enums';
import {isOhlcData} from '@shared/models/type_guards';

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
  hasLegend: boolean;
  additionalLegendText?: string;
  typeSeries?: keyof SeriesDataItemTypeMap;
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
 * @param hasLegend {boolean} - показывать ли текст обозначение на графике
 * @param [additionalLegendText] {string} - дополнительный текст в legend
 * @param [typeSeries] {ChartAvailableTypes} - тип графика
 * 
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
  hasLegend,
  additionalLegendText,
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
    if (hasLegend) {
      chart.subscribeCrosshairMove((param) => {
        let priceOpen = '';
        let priceMax = '';
        let priceMin = '';
        let priceClose = '';

        if (!param.point) {
          return;
        }

        if (param.time && series) {
          const data = param.seriesData.get(series);

          if (legendRef.current && isOhlcData(data)) {
            const isGreen = data?.close > data.open;

            priceOpen = data.open.toFixed(2);
            priceMax = data.high.toFixed(2);
            priceMin = data.low.toFixed(2);
            priceClose = data.close.toFixed(2);

            legendRef.current.style.color = isGreen ? upColor : downColor;

            legendRef.current.innerHTML = `
            <div><span id='legend'>${additionalLegendText}</span></div>
            <div><span id='legend'>ОТКР</span> <span>${priceOpen}</span></div>
            <div><span id='legend'>МАКС</span> <span>${priceMax}</span></div>
            <div><span id='legend'>МИН</span> <span>${priceMin}</span></div>
            <div><span id='legend'>ЗАКР</span> <span>${priceClose}</span></div>
          `;
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
