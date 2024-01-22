import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { MintContext } from '..';
import { cn } from '@nextui-org/react';
import { MintStatus } from '@/constant/mint';

function MintTips() {
  const { status, mintNo } = useContext(MintContext);

  const WhitelistedTips = () => {
    return (
      <div className="px-7 py-6 max-w-[37.5rem] border-1 border-[#1A1A1A] text-sm text-[#999999] rounded-base">
        Congratulations, you are eligible to mint ONE Destiny Tetra NFT, click MINT NOW to finish the process.
      </div>
    );
  };

  const MintedTips = () => {
    const nos = mintNo.toString().padStart(4, '0').split('');

    return (
      <div className="font-poppins px-7 py-6 max-w-[62.5rem] border-2 border-[#665C50] text-white rounded-base">
        <div className="text-lg">
          Congratulations on receiving the unique Destiny Tetra NFT with the identification number
        </div>
        <div className="flex justify-center items-center text-4xl text-basic-yellow gap-1 mt-3">
          {nos.map((no, index) => (
            <span key={index} className="inline-block w-[2.125rem] border-b-2 border-[#3E3123] text-center">
              {no}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-16">
      {status >= MintStatus.MINTED ? <MintedTips /> : status >= MintStatus.WHITELISTED ? <WhitelistedTips /> : false}
    </div>
  );
}

export default observer(MintTips);
