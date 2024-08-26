import Head from 'next/head';
import ProfileHeader from './components/ProfileHeader';
import MoonBeams from './components/MoonBeams';
import MyBadges from './components/MyBadges';
// import DailyCheckIn from '@/components/LoyaltyProgram/earn/EarnBanner/DailyCheckIn';
import Invite from '@/components/LoyaltyProgram/earn/EarnBanner/Invite';
import MyNFT from './components/MyNFT';
// import EventsParticipated from './components/EventsParticipated';
import BattlePassCard from '@/components/card/BattlePassCard';
import MyTokens from '@/components/profile/MyTokens';

export default function ProfilePage() {
  return (
    <section
      id="luxy"
      className="w-full flex flex-col px-12 lg:px-[16.25rem] pt-[12.5rem] pb-[16rem] mx-auto min-h-screen bg-[url('/img/profile/bg.png')] bg-[length:100%_auto] bg-no-repeat"
    >
      <Head>
        <title>User Center | Moonveil Entertainment</title>
      </Head>

      <ProfileHeader />

      <div className="flex flex-wrap gap-10 mt-[2.8125rem]">
        <MoonBeams />

        <MyBadges />

        {/* <DailyCheckIn /> */}

        {/* 如果增加拉新模块，将赛季模块放到最后并设置block=true */}
        <BattlePassCard />

        <Invite inProfie />
      </div>

      <MyNFT />

      {/* <EventsParticipated /> */}
      
      <MyTokens />
    </section>
  );
}
