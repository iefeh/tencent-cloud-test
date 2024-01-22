import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { MintContext } from '..';
import { MintStatus } from '@/constant/mint';
import { useRouter } from 'next/router';

function MintTips() {
  const { status, mintNo } = useContext(MintContext);

  const WhitelistedTips = () => {
    return (
      <div className="px-7 py-6 max-w-[37.5rem] border-1 border-[#1A1A1A] text-sm text-[#999999] rounded-base">
        Congratulations, you are eligible to mint ONE Destiny Tetra NFT, click MINT NOW to finish the process.
      </div>
    );
  };

  const MintedFailedTips = () => {
    return (
      <div className="px-7 py-6 max-w-[37.5rem] border-1 border-[#1A1A1A] text-sm text-[#999999] rounded-base">
        We regret to inform you that this minting process for your Destiny TETRA NFT has failed. Please consider trying
        again next time, and we wish you the best of luck!
      </div>
    );
  };

  const MintedTips = () => {
    // const nos = mintNo.toString().padStart(4, '0').split('');
    const router = useRouter();

    function onGotoUserCenter(e: MouseEvent) {
      e.preventDefault();
      router.push('/Profile');
    }

    return (
      <div className="font-poppins px-7 py-6 max-w-[62.5rem] border-2 border-[#665C50] text-white rounded-base">
        <div className="text-lg">
          Congratulations on receiving your Destiny TETRA NFT, please check the unique identification number of each
          TETRA NFT from the{' '}
          <a
            className="text-basic-yellow underline cursor-pointer"
            onClick={(e) => onGotoUserCenter(e as any as MouseEvent)}
          >
            USER CENTER
          </a>
          .
        </div>
        {/* <div className="flex justify-center items-center text-4xl text-basic-yellow gap-1 mt-3">
          {nos.map((no, index) => (
            <span key={index} className="inline-block w-[2.125rem] border-b-2 border-[#3E3123] text-center">
              {no}
            </span>
          ))}
        </div> */}
      </div>
    );
  };

  const SoldOutTips = () => {
    return (
      <div className="px-7 py-6 max-w-[37.5rem] border-1 border-[#1A1A1A] text-sm text-[#999999] rounded-base">
        <div className="text-3xl text-center">We’ve Sold OUT! </div>
        <div className='mt-4'>
          All 800 Genesis NFT Collection have been Minted. Thank you for your unbelievable Support. We are grateful to
          our community and everyone who participated in the Mint.
        </div>
      </div>
    );
  };

  return (
    <div className="mt-16">
      {status === MintStatus.SOLD_OUT ? (
        <SoldOutTips />
      ) : status === MintStatus.MINTED ? (
        <MintedTips />
      ) : status === MintStatus.WRONG_MINTED ? (
        <MintedFailedTips />
      ) : status >= MintStatus.WHITELISTED ? (
        <WhitelistedTips />
      ) : (
        false
      )}
    </div>
  );
}

export default observer(MintTips);
