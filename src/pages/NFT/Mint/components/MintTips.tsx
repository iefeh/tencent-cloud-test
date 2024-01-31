import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { MintContext } from '..';
import TextLink from '@/pages/components/common/TextLink';
import { MintState } from '@/constant/mint';
import { MobxContext } from '@/pages/_app';
import { useWeb3ModalAccount } from '@web3modal/ethers/react';

function MintTips() {
  const { state, nowCount, grCount, frCount, canMint, isEnded, isReady, minted, isWhitelistChecked, hasMintError } =
    useContext(MintContext);
  const { userInfo } = useContext(MobxContext);
  const { address } = useWeb3ModalAccount();

  const MintErrorTips = () => {
    return (
      <div className="px-7 py-6 max-w-[62.5rem] border-1 border-[#1A1A1A] text-sm text-[#999999] rounded-base break-all">
        {isReady ? (
          <div>
            Unfortunately, you were unable to mint the Destiny TETRA NFT. We genuinely appreciate your participation in
            our whitelist player journey. Stay tuned for more exciting opportunities ahead, and we look forward to
            having you join us again!
          </div>
        ) : (
          <div>
            Please make sure to connect to a wallet that corresponds to the address associated with the currently
            logged-in account(<span className="text-basic-yellow">{userInfo?.wallet}</span>). Your currently connected
            wallet is: <span className="text-basic-yellow">{address?.toLowerCase() || 'null'}</span>.
          </div>
        )}
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
        <div className="text-3xl text-center font-semakin">WE MINTED OUT!</div>
        <div className="mt-4">
          All 800 Genesis NFT Collection have been Minted. Thank you for your unbelievable Support. We are grateful to
          our community and everyone who participated in the Mint.
        </div>
      </div>
    );
  };

  const GuaranteedRoundTips = () => {
    return (
      <div className="px-7 py-6 max-w-[62.5rem] border-1 border-[#1A1A1A] text-sm rounded-base">
        <p>
          Welcome to the <span className="font-semakin">Guaranteed Mint Round</span>! Here is your available whitelist
          status:
        </p>

        <ul>
          <li>
            <div>
              <span className="inline-block w-2 h-2 mr-3 rounded-full bg-current"></span>Guaranteed whitelist spot(s):
              <span className="ml-2 text-basic-yellow font-semakin underline text-xl">{grCount}</span>;
            </div>
            <div>
              <span className="inline-block w-2 h-2 mr-3 rounded-full bg-current"></span>FCFS whitelist spot(s):
              <span className="ml-2 text-basic-yellow font-semakin underline text-xl">{frCount}</span>;
            </div>
          </li>
        </ul>

        <p>Please select the quantity you&apos;d like to mint and click [Mint Now] to proceed.</p>
      </div>
    );
  };

  const FCFSRoundTips = () => {
    return (
      <div className="px-7 py-6 max-w-[62.5rem] border-1 border-[#1A1A1A] text-sm rounded-base">
        <p>
          Welcome to the <span className="font-semakin">FCFS (first-come-first-serve) Mint Round</span>! Here is your
          available whitelist spot(s):{' '}
          <span className="ml-2 text-basic-yellow font-semakin underline text-xl">{nowCount}</span>
        </p>

        <p>Please select the quantity you&apos;d like to mint and click [Mint Now] to proceed.</p>
      </div>
    );
  };

  const PublicRoundTips = () => {
    return (
      <div className="px-7 py-6 max-w-[62.5rem] border-1 border-[#1A1A1A] text-sm rounded-base">
        <p>
          Welcome to the <span className="font-semakin">Public Mint Round</span>! Here is your available whitelist
          spot(s): <span className="ml-2 text-basic-yellow font-semakin underline text-xl">{nowCount}</span>
        </p>

        <p>Please select the quantity you&apos;d like to mint and click [Mint Now] to proceed.</p>
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
      if (hasMintError) return <MintErrorTips />;
      if (!isWhitelistChecked) return null;
      if (minted) return <MintedTips />;

      if (state === MintState.GuaranteedRound) return <GuaranteedRoundTips />;
      if (state === MintState.FCFS_Round) return <FCFSRoundTips />;
      if (state === MintState.PublicRound) return <PublicRoundTips />;
    } else {
      if (isWhitelistChecked) return <CheckWhitelistTips />;
    }
  }

  const tips = getTips();
  if (!tips) return null;

  return <div className="mt-10 font-poppins">{getTips()}</div>;
}

export default observer(MintTips);
