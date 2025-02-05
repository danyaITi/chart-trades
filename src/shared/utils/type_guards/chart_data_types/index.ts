import {BarData, CustomData, HistogramData, LineData, OhlcData} from 'lightweight-charts';

// Type guard для выделения типа OhlcData
export const isOhlcData = (arg: BarData | LineData | HistogramData | CustomData | undefined): arg is OhlcData => {
  return (
    typeof arg === 'object' &&
    arg !== null &&
    'open' in arg &&
    'high' in arg &&
    'low' in arg &&
    'close' in arg &&
    'time' in arg
  );
};
