import Head from 'next/head';
import PreviewBox from './components/PreviewBox';

export default function WhitelistTasks() {
  return (
    <>
      <section id="luxy" className="w-full flex flex-col z-10">
        <Head>
          <title>WhitelistTasks | Moonveil Entertainment</title>
        </Head>

        <div className="page-container w-full pl-[36.5%]">WhitelistTasks</div>

        <PreviewBox />
      </section>
    </>
  );
}
