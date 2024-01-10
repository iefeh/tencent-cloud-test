import Head from "next/head";
import BannerAndRank from "./components/BannerAndRank";
import EarnBanner from "./components/EarnBanner";
import TaskTabs from "./components/TaskTabs";

export default function LoyaltyEarn() {
  return (
    <section id="luxy" className="w-full flex flex-col lg:px-[16.25rem] [&>div]:mx-auto">
      <Head>
        <title>Earn Moon Beams | Moonveil Entertainment</title>
      </Head>

      <BannerAndRank />

      <EarnBanner />

      <TaskTabs />
    </section>
  );
}
