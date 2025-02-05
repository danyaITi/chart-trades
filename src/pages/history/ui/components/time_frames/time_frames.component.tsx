import {Button} from '@shared/components';
import {classNames} from '@shared/utils';
import styles from './styles.module.scss';
import {TimeFrame} from '@pages/history/models';

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

type Props = {
  selectedTimeFrame: TimeFrame;
  setSelectedTimeFrame: (value: TimeFrame) => void;
};

export const TimeFrames = ({selectedTimeFrame, setSelectedTimeFrame}: Props) => {
  // Выбирает временные рамки для показа на графике
  const selectTimeFrameHandler = (time: TimeFrame) => () => {
    setSelectedTimeFrame(time);
  };

  return (
    <ul>
      {TIME_FRAMES.map((timeFrame, index) => (
        <Button
          key={index}
          className={classNames(styles.timeFrameButton, {[styles.selected]: selectedTimeFrame === timeFrame})}
          onClick={selectTimeFrameHandler(timeFrame)}>
          {timeFrame}
        </Button>
      ))}
    </ul>
  );
};
