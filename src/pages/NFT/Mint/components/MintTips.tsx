import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { MintContext } from '..';
import TextLink from '@/pages/components/common/TextLink';

function MintTips() {
  const { nowCount, grCount, frCount, canMint, isEnded, minted, isWhitelistChecked } = useContext(MintContext);

  const WhitelistedTips = () => {
    return (
      <div className="px-7 py-6 max-w-[37.5rem] border-1 border-[#1A1A1A] text-sm text-[#999999] rounded-base">
        Congratulations, you are eligible to mint{' '}
        <span className="font-semakin text-basic-yellow underline">{nowCount}</span> Destiny Tetra NFT, click MINT NOW
        to finish the process.
      </div>
    );
  };

  const MintedTips = () => {
    return (
      <div className="px-7 py-6 max-w-[62.5rem] border-2 border-[#665C50] text-white rounded-base">
        <div className="text-lg">
          Congratulations on receiving your Destiny TETRA NFT, please check the unique identification number of each
          TETRA NFT from the <TextLink className="uppercase" label="User Center" to="/Profile" />.
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
      <div className="px-7 py-6 max-w-[62.5rem] border-1 border-[#1A1A1A] text-sm rounded-base">
        <p>
          Thank you for being part of our whitelist journey! Here&apos;s the current status of your whitelist spots:
        </p>

        <ul>
          <li className="flex items-center">
            <span className="inline-block w-2 h-2 mr-3 rounded-full bg-current"></span>Guaranteed whitelist spot(s):
            <span className="ml-2 text-basic-yellow font-semakin underline text-xl">{grCount}</span>
          </li>
          <li className="flex items-center">
            <span className="inline-block w-2 h-2 mr-3 rounded-full bg-current"></span>FCFS (First Come, First Served)
            whitelist spot(s):<span className="ml-2 text-basic-yellow font-semakin underline text-xl">{frCount}</span>
          </li>
        </ul>

        <p>
          Please be informed that the official MINT will commence on{' '}
          <span className="text-basic-yellow">Jan 31 at 9 AM EST</span>. We look forward to your participation! Kindly
          return to this page at that time.
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

  const tips = getTips();
  if (!tips) return null;

  return <div className="mt-10 font-poppins">{getTips()}</div>;
}

export default observer(MintTips);
