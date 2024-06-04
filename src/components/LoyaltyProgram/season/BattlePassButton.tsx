import BasicButton from '@/pages/components/common/BasicButton';
import { useBattlePassContext } from '@/store/BattlePass';
import { Tooltip, cn } from '@nextui-org/react';
import { observer } from 'mobx-react-lite';
import { FC, useEffect, useRef } from 'react';
import Link from 'next/link';
import { URL_OPENSEA } from '@/constant/common';

interface Props {
  className?: string;
  onRuleClick?: () => void;
}

const BattlePass: FC<Props> = ({ className, onRuleClick }) => {
  const { info, init } = useBattlePassContext();
  const { is_premium } = info || {};
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    init();
  }, []);

  const content = (
    <div ref={nodeRef} className={cn(['flex flex-col items-center', className])}>
      {is_premium ? (
        <BasicButton className="uppercase w-max h-10" label="Premium Pass Activated" disabled />
      ) : (
        <Tooltip
          classNames={{ content: 'bg-[#141414] p-7 rounded-base border-1 border-[#2A2A2A]' }}
          content={
            <div className="max-w-[31.25rem]">
              <p>If you meet any of the following conditions, you can claim the Premium Pass for free.</p>
              <p className="mt-2">
                - TETRA Holder: TETRA NFT holders are eligible to claim the Premium Pass{' '}
                <span className="text-basic-yellow">during the holding period</span>.{' '}
                <Link className="text-basic-yellow underline" href={URL_OPENSEA}>
                  Get TETRA Now
                </Link>
              </p>

              <p className="mt-2">
                - BADGE: Users holding selected high-level Badges can also claim the Premium Pass. Details can be found
                in the{' '}
                <span className="text-basic-yellow cursor-pointer underline" onClick={onRuleClick}>
                  Rules
                </span>
              </p>

              {/* <p>
                - Purchase: You can also purchase the Premium Battle Pass from{' '}
                <span className="text-basic-yellow cursor-pointer underline">here</span>
              </p> */}
            </div>
          }
        >
          <div>
            <BasicButton className="uppercase w-max h-10" label="Upgrade to Premium Pass" />
          </div>
        </Tooltip>
      )}
    </div>
  );

  return content;
};

export default observer(BattlePass);
