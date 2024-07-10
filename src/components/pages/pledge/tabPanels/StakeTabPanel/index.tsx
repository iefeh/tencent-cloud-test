import StepInput from '@/components/common/inputs/StepInput';
import { FC, useEffect, useState } from 'react';
import StakingRewards from './StakingRewards';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { usePledgeContext } from '@/store/Pledge';
import { observer } from 'mobx-react-lite';
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers/react';
import useBalance from '@/hooks/wallet/useBalance';
import { toast } from 'react-toastify';
import { PoolType } from '@/constant/pledge';

interface Props {
  poolKey: string;
}

const StakeTabPanel: FC<Props> = ({ poolKey }) => {
  const [stakeValue, setStateValue] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentBalance, currentType, stake, currentPoolInfo, refresh, formatUnits } = usePledgeContext();
  const { walletProvider } = useWeb3ModalProvider();
  const { balance } = useBalance();
  const balanceVal = (+formatUnits(currentType === PoolType.ETH ? balance : currentBalance)).toFixed(5);
  const { address } = useWeb3ModalAccount();

  async function onStake() {
    setLoading(true);

    const res = await stake(walletProvider!, stakeValue, +duration);
    if (res) {
      toast.success(`You have successfully staked ${stakeValue} ${poolKey}.`);
      setStateValue('');
      setDuration('');
      refresh(walletProvider!, address!);
    }

    setLoading(false);
  }

  return (
    <div className="px-16 flex flex-col items-center">
      <div className="flex justify-between gap-x-36">
        <StepInput
          value={stakeValue}
          title={`Add ${poolKey}`}
          caption={
            <div className="font-poppins font-semibold">
              Balance <span className="text-basic-yellow">{balanceVal}</span>{' '}
              <span className="uppercase">{poolKey}</span>
            </div>
          }
          nodeType="progress"
          nodes={5}
          total={+(balanceVal || 0)}
          appendLabel={poolKey}
          onValueChange={setStateValue}
        />

        <StepInput
          value={duration}
          title="Duration"
          nodeType="button"
          nodes={[
            { label: 'no lock', value: 0 },
            { label: '1 week', value: 1 },
            { label: '1 month', value: 4 },
            { label: '3 months', value: 12 },
          ]}
          limitMax
          total={12}
          appendLabel="weeks"
          onValueChange={setDuration}
        />
      </div>

      <StakingRewards stakeValue={stakeValue} duration={duration} />

      <LGButton
        className="uppercase w-[14.375rem] h-[3.1875rem] text-xl font-semibold mt-24"
        label="Stake"
        actived
        disabled={
          currentPoolInfo[6] ||
          currentPoolInfo[7] ||
          !stakeValue ||
          +stakeValue <= 0 ||
          !duration ||
          !walletProvider ||
          +stakeValue > +balanceVal
        }
        loading={loading}
        onClick={onStake}
      />
    </div>
  );
};

export default observer(StakeTabPanel);
