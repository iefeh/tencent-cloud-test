import PageDesc from '@/pages/components/common/PageDesc';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { FC } from 'react';

const DrawScreenMainContent: FC = () => {
  return (
    <PageDesc
      title={
        <div className="font-semakin">
          <span className="stroke-text text-[4rem]" data-text="WIN">
            WIN
          </span>

          <span className="stroke-text text-[6rem]" data-text="$500 USDT">
            $500 USDT
          </span>
        </div>
      }
      subtitle={
        <div className="flex items-center font-semakin">
          <div className="text-right">
            <div className="text-2xl">guaranteed in</div>
            <div className="text-[2rem] bg-gradient-to-b from-[#E7D4A9] to-[#DBAC74] bg-clip-text text-transparent">
              3000 Collective Draws
            </div>
          </div>

          <div className="stroke-text text-[4rem]" data-text="Per Pool">
            Per Pool
          </div>
        </div>
      }
      button={<LGButton className="uppercase mt-8" label="Prize Pool" actived />}
    />
  );
};

export default DrawScreenMainContent;
