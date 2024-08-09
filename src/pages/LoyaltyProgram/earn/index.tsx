import TaskTabs from '@/components/LoyaltyProgram/task/TaskTabs';
import TaskPassCard from '@/components/card/TaskPassCard';
import { Button, cn } from '@nextui-org/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { createPortal } from 'react-dom';

export default function ProfilePage() {
  const router = useRouter();

  return (
    <section
      id="luxy"
      className="w-full flex flex-col px-12 lg:px-[16.25rem] pt-[12.5rem] pb-[16rem] mx-auto min-h-screen bg-[url('/img/profile/bg.png')] bg-[length:100%_auto] bg-no-repeat"
    >
      <Head>
        <title>Tasks | Moonveil Entertainment</title>
      </Head>

      <div className="flex flex-col gap-10 mt-[2.8125rem]">
        <div className="font-semakin text-5xl text-basic-yellow">Tasks</div>

        <div className="text-base">
          Welcome to the Task Center for Rock&apos;it to the Moon Season! Complete as many tasks as possible to boost
          your rocket and fly to the moon!
        </div>

        <TaskPassCard />

        <TaskTabs />
      </div>

      {createPortal(
        <Button
          className={cn([
            'w-44 h-[7.5rem] !rounded-base transition-shadow hover:shadow-[0_0_8px_1px_#f6c799]',
            "bg-[url('/img/loyalty/task/card_pass.png')] bg-no-repeat bg-cover",
            'fixed right-16 bottom-16',
          ])}
          onPress={() => router.push('/LoyaltyProgram/season/foresight')}
        />,
        document.body,
      )}
    </section>
  );
}
