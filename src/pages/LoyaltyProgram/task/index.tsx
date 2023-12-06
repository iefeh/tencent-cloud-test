import Head from "next/head";
import TaskDetails from "./TaskDetails";
import TaskReward from "./TaskReward";

export default function LoyaltyTask() {
  return (
    <section id="luxy" className="w-full flex flex-col px-[16.25rem] [&>div]:mx-auto">
      <Head>
        <title>TaskDetails | Moonveil</title>
      </Head>

      <div className="flex gap-[3.125rem] pt-[10.9375rem]">
        <TaskDetails />

        <TaskReward />
      </div>
    </section>
  );
}
