import { Card, CardBody, Divider } from '@nextui-org/react';
import ShareButton from '@/pages/components/common/ShareButton';
import Descriptions from './components/Descriptions';
import { FullEventItem } from '@/http/services/task';
import { EVENT_STATUS_CLASS_DICT } from '@/constant/task';
import EventTasks from './components/EventTasks';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import HotBanner from './components/HotBanner';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);

interface Props {
  item?: FullEventItem;
  onRefresh?: () => void;
}

export default function TaskDetails(props: Props) {
  const { item, onRefresh } = props;
  const endTime = item?.end_time
    ? dayjs(item.end_time).tz(dayjs.tz.guess()).format('MMMM DD, YYYY, hh:mm A zzz')
    : '--';

  return (
    <div className="w-[56.25rem] pb-[16.5rem]">
      <div className="font-semakin text-[2.5rem]">{item ? item.name : '--'}</div>

      <div className="w-full flex justify-between items-center">
        <div className="flex items-center gap-[0.9375rem]">
          <Card className="basic-card text-basic-yellow shrink-0">
            <CardBody>
              <p>{item && item.status ? EVENT_STATUS_CLASS_DICT[item.status].label : '--'}</p>
            </CardBody>
          </Card>

          <Card className="basic-card">
            <CardBody>
              <p>End Date of the Event: {endTime}</p>
            </CardBody>
          </Card>
        </div>

        <ShareButton />
      </div>

      <Divider className="my-[2.625rem]" />

      {item?.image_url && (
        <>
          <HotBanner item={item} />

          <Divider className="my-[2.625rem]" />
        </>
      )}

      <EventTasks item={item} updateTasks={onRefresh} />

      <Descriptions content={item ? item.description : '--'} />
    </div>
  );
}
