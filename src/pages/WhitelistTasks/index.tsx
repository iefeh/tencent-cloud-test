import Head from 'next/head';
import PreviewBox from './components/PreviewBox';
import TaskView from './components/TaskView';

export default function WhitelistTasks() {
  return (
    <>
      <section id="luxy" className="w-full flex flex-col z-10">
        <Head>
          <title>WhitelistTasks | Moonveil Entertainment</title>
        </Head>

        <div className="page-container w-full">
          <TaskView />
        </div>

        <PreviewBox />
      </section>
    </>
  );
}
