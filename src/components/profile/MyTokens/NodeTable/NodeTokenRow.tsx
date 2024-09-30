import type { NodeTokensRecord } from '@/http/services/token';
import dayjs from 'dayjs';
import { FC } from 'react';

interface Props {
  item: NodeTokensRecord;
}

const NodeTokenRow: FC<Props> = ({ item }) => {
  function formatTime(val: number) {
    if (!val) return null;
    return dayjs(val).format('YYYY-MM-DD HH:mm:ss');
  }

  return (
    <ul className="text-base text-white transition-colors border-1 border-transparent rounded-base hover:border-basic-yellow">
      <li
        key={`${item.source}_${item.created_time}`}
        className="flex justify-between items-center h-16 text-[#999] px-10 gap-4"
      >
        <div className="flex-[264] whitespace-nowrap text-ellipsis overflow-hidden">{item.node_tier || '--'}</div>

        <div className="flex-[224] whitespace-nowrap text-ellipsis overflow-hidden">{item.node_amount || '--'}</div>

        <div className="flex-[360] whitespace-nowrap text-ellipsis overflow-hidden">{item.source || '--'}</div>

        <div className="flex-[180] whitespace-nowrap text-ellipsis overflow-hidden">{item.source_type || '--'}</div>

        <div className="w-40 shrink-0 flex justify-end">{formatTime(item.created_time) || '--'}</div>
      </li>
    </ul>
  );
};

export default NodeTokenRow;
