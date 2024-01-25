import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { MintContext } from '..';
import { MintState, MintStatus } from '@/constant/mint';
import { useRouter } from 'next/router';

function MintTips() {
  const { grCount, frCount, canMint, isEnded, minted, isWhitelistChecked } = useContext(MintContext);
  const router = useRouter();

  function onGotoUserCenter(e: MouseEvent) {
    e.preventDefault();
    router.push('/Profile');
  }

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
    return (
      <div className="px-7 py-6 max-w-[62.5rem] border-2 border-[#665C50] text-white rounded-base">
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
      </div>
    );
  };

  const SoldOutTips = () => {
    return (
      <div className="px-7 py-6 max-w-[37.5rem] border-1 border-[#1A1A1A] text-sm text-[#999999] rounded-base">
        <div className="text-3xl text-center">We’ve Sold OUT! </div>
        <div className="mt-4">
          All 800 Genesis NFT Collection have been Minted. Thank you for your unbelievable Support. We are grateful to
          our community and everyone who participated in the Mint.
        </div>
      </div>
    );
  };

  const CheckWhitelistTips = () => {
    return (
      <div className="px-7 py-6 max-w-[37.5rem] border-1 border-[#1A1A1A] text-sm text-[#999999] rounded-base">
        <p>
          Thank you for being part of our whitelist journey! Here`&apos;`s the current status of your whitelist spots:
        </p>

        <ul>
          <li>- Guaranteed whitelist spot(s): {grCount}</li>
          <li>- FCFS (First Come, First Served) whitelist spot(s): {frCount}</li>
        </ul>

        <p>
          Please be informed that the official MINT will commence on January 31st at 9 pm EST. We look forward to your
          participation! Kindly return to this page at that time.
        </p>
      </div>
    );
  };

  function getTips() {
    if (isEnded) return <SoldOutTips />;
    if (canMint) {
      if (minted) return <MintedTips />;
      if (isWhitelistChecked) return <WhitelistedTips />;
    } else {
      if (isWhitelistChecked) return <CheckWhitelistTips />;
    }
  }

  return <div className="mt-12 font-poppins">{getTips()}</div>;
}

export default observer(MintTips);
