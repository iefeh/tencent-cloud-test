import { Card, CardBody } from '@nextui-org/react';
import ShareButton from '@/pages/components/common/ShareButton';

export default function TaskDetails() {
  return (
    <div className="w-[56.25rem]">
      <div className="font-semakin text-[2.5rem]">AstrArk Character Voice Rally</div>

      <div className="w-full flex justify-between items-center">
        <div className="flex items-center gap-[0.9375rem]">
          <Card className="basic-card text-basic-yellow">
            <CardBody>
              <p>In Progress</p>
            </CardBody>
          </Card>

          <Card className="basic-card">
            <CardBody>
              <p>End Date of the Event: January 30, 2024, at 6:00 PM Singapore Time</p>
            </CardBody>
          </Card>
        </div>

        <ShareButton />
      </div>
    </div>
  );
}
