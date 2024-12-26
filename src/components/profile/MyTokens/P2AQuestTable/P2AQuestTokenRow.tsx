import type { P2AQuestTokensRecord } from '@/http/services/token';
import dayjs from 'dayjs';
import { FC } from 'react';

interface Props {
  item: P2AQuestTokensRecord;
}

const P2AQuestTokenRow: FC<Props> = ({ item }) => {
  function formatTime(time: number) {
    return dayjs(time).format('YYYY-MM-DD HH:mm:ss');
  }

  return (
    <ul className="text-base text-white transition-colors border-1 border-transparent rounded-base hover:border-basic-yellow">
      <li
        key={`${item.source}_${item.created_time}`}
        className="flex justify-between items-center h-16 text-[#999] px-0 md:px-10 gap-4"
      >
        <div className="flex-[360] whitespace-nowrap text-ellipsis overflow-hidden">{item.source || '--'}</div>

        <div className="flex-[264] whitespace-nowrap text-ellipsis overflow-hidden uppercase">
          {item.source_type || '--'}
        </div>

        <div className="flex-[224] whitespace-nowrap text-ellipsis overflow-hidden">
          {item.more_delta < 0 ? '- ' : '+ '} {Math.abs(item.more_delta || 0)} $MORE
        </div>

        <div className="flex-[156] whitespace-normal text-right">{item.created_time ? formatTime(item.created_time) : '--'}</div>
      </li>
    </ul>
  );
};

export default P2AQuestTokenRow;
