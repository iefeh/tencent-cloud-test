import { FC } from 'react';
import ValueItem from './ValueItem';
import { usePledgeContext } from '@/store/Pledge';
import { observer } from 'mobx-react-lite';

const ValueItems: FC = () => {
  const { poolsTotalValue } = usePledgeContext();

  return (
    <div className="flex justify-center items-center mt-5 gap-[6.5rem]">
      <ValueItem
        icon="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/pledge/icon_locked_value.png"
        label="Total Staked Value"
        value={`$${poolsTotalValue || '-'}`}
      />
    </div>
  );
};

export default observer(ValueItems);
