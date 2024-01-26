import MintStore, { useStore } from '@/store/Mint';
import Head from 'next/head';
import { createContext } from 'react';
import Mint from './components/Mint';
import MintTips from './components/MintTips';
import MintButtons from './components/MintButtons';
import MintProgress from './components/MintProgress';
import { observer } from 'mobx-react-lite';
import TextLink from '@/pages/components/common/TextLink';

export const MintContext = createContext<MintStore>(new MintStore());

function MintPage() {
  const store = useStore();
  const { isEnded, isWhitelistChecked, canMint, minted } = store;

  return (
    <section id="luxy">
      <Head>
        <title>NFT | Moonveil Entertainment</title>
      </Head>

      <MintContext.Provider value={store}>
        <div className="w-screen min-h-screen bg-[url('/img/nft/mint/bg.jpg')] bg-cover bg-no-repeat flex flex-col items-center justify-center font-poppins">
          <Mint />
          <MintTips />
          {!isEnded && <MintButtons />}

          <div className="px-4 py-2 mt-6 max-w-[62.5rem] border-2 border-[#665C50] text-white rounded-base">
            <div className="text-lg">
              If you already own any Moonveil NFT(s), please check from the{' '}
              <TextLink className="uppercase" label="User Center" to="/Profile" />.
            </div>
          </div>

          {!isEnded && (canMint ? !minted : !isWhitelistChecked) && <MintProgress />}
        </div>
      </MintContext.Provider>
    </section>
  );
}

export default observer(MintPage);
