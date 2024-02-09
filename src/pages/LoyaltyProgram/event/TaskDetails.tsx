import { Card, CardBody, Divider } from '@nextui-org/react';
import ShareButton from '@/pages/components/common/ShareButton';
import Tasks from './components/Tasks';
import Descriptions from './components/Descriptions';
import { FullEventItem } from '@/http/services/task';
import { EVENT_STATUS_CLASS_DICT } from '@/constant/task';

interface Props {
  item?: FullEventItem;
}

export default function TaskDetails(props: Props) {
  const { item } = props;

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

      <Tasks items={item && item.tasks ? item.tasks : []} />

      <Descriptions content={item ? item.description : '--'} />
    </div>
  );
}
