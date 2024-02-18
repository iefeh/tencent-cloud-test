import { Card, CardBody, Divider } from '@nextui-org/react';
import ShareButton from '@/pages/components/common/ShareButton';
import Descriptions from './components/Descriptions';
import { FullEventItem } from '@/http/services/task';
import { EVENT_STATUS_CLASS_DICT } from '@/constant/task';
import EventTasks from './components/EventTasks';

interface Props {
  item?: FullEventItem;
  onRefresh?: () => void;
}

export default function TaskDetails(props: Props) {
  const { item, onRefresh } = props;

  return (
    <div className="w-[56.25rem] pb-[16.5rem]">
      <div className="font-semakin text-[2.5rem]">{item ? item.name : '--'}</div>

      <div className="w-full flex justify-between items-center">
        <div className="flex items-center gap-[0.9375rem]">
          <Card className="basic-card text-basic-yellow">
            <CardBody>
              <p>{item && item.status ? EVENT_STATUS_CLASS_DICT[item.status].label : '--'}</p>
            </CardBody>
          </Card>

          <Card className="basic-card">
            <CardBody>
              <p>End Date of the Event: {item ? item.end_time : '--'}</p>
            </CardBody>
          </Card>
        </div>

        <ShareButton />
      </div>

      <Divider className="my-[2.625rem]" />

      <EventTasks item={item} updateTasks={onRefresh} />

      <Descriptions content={item ? item.description : '--'} />
    </div>
  );
}
