import MintStore, { useStore } from '@/store/Mint';
import Head from 'next/head';
import { createContext } from 'react';
import Mint from './components/Mint';
import MintTips from './components/MintTips';
import MintButtons from './components/MintButtons';
import MintProgress from './components/MintProgress';
import { observer } from 'mobx-react-lite';

export const MintContext = createContext<MintStore>(new MintStore());

function MintPage() {
  const store = useStore();

  return (
    <section id="luxy">
      <Head>
        <title>NFT | Moonveil Entertainment</title>
      </Head>

      <MintContext.Provider value={store}>
        <div className="w-screen min-h-screen bg-[url('/img/nft/mint/bg.jpg')] bg-cover bg-no-repeat flex flex-col items-center justify-center font-poppins">
          <Mint />

          <MintTips />

          {!store.isEnded && <MintButtons />}

          {!store.isEnded && !store.minted && <MintProgress />}
        </div>
      </MintContext.Provider>
    </section>
  );
}

export default observer(MintPage);
