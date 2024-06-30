import StepInput from '@/components/common/inputs/StepInput';
import { FC, useState } from 'react';
import StakingRewards from './StakingRewards';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { usePledgeContext } from '@/store/Pledge';
import { observer } from 'mobx-react-lite';
import { useWeb3ModalProvider } from '@web3modal/ethers/react';

interface Props {
  poolKey: string;
}

const StakeTabPanel: FC<Props> = ({ poolKey }) => {
  const [stakeValue, setStateValue] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const { stake } = usePledgeContext();
  const { walletProvider } = useWeb3ModalProvider();

  async function onStake() {
    setLoading(true);

    await stake(walletProvider!, +stakeValue, +duration);

    setLoading(false);
  }

  return (
    <div className="px-16 flex flex-col items-center">
      <div className="flex justify-between gap-x-36">
        <StepInput
          value={stakeValue}
          title={`Add ${poolKey}`}
          nodeType="progress"
          nodes={5}
          total={5000}
          appendLabel={poolKey}
          onValueChange={setStateValue}
        />

        <StepInput value={duration} title="Duration" nodeType="button" nodes={[]} onValueChange={setDuration} />
      </div>

      <StakingRewards />

      <LGButton
        className="uppercase w-[14.375rem] h-[3.1875rem] text-xl font-semibold mt-24"
        label="Stake"
        actived
        disabled={!stakeValue || !duration || !walletProvider}
        onClick={onStake}
      />
    </div>
  );
};

export default observer(StakeTabPanel);
