import { FC } from 'react';
import ValueItem from './ValueItem';
// import useWallet from '@/hooks/useWallet';
import { usePledgeContext } from '@/store/Pledge';
import { observer } from 'mobx-react-lite';

const ValueItems: FC = () => {
  // const { connected } = useWallet();
  const { currentPoolInfo } = usePledgeContext();

  return (
    <div className="flex justify-center items-center mt-5 gap-[6.5rem]">
      {/* {connected && (
        <ValueItem
          icon="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/pledge/icon_staking_points.png"
          label="My Staking Points"
          value="5678"
        />
      )} */}

      <ValueItem
        icon="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/pledge/icon_locked_value.png"
        label="Total Locked Value"
        value={currentPoolInfo[2]?.toString() || '-'}
      />
    </div>
  );
};

export default observer(ValueItems);
