import Head from 'next/head';
import ProfileHeader from './components/ProfileHeader';
import MoonBeams from './components/MoonBeams';
import MyBadges from './components/MyBadges';
import DailyCheckIn from '../LoyaltyProgram/earn/components/EarnBanner/DailyCheckIn';
import Invite from '../LoyaltyProgram/earn/components/EarnBanner/Invite';
import MyNFT from './components/MyNFT';
import EventsParticipated from './components/EventsParticipated';

export default function ProfilePage() {
  return (
    <section
      id="luxy"
      className="w-full flex flex-col px-[16.25rem] pt-[12.5rem] pb-[16rem] mx-auto min-h-screen bg-[url('/img/profile/bg.png')] bg-[length:100%_auto] bg-no-repeat"
    >
      <Head>
        <title>User Center | Moonveil Entertainment</title>
      </Head>

      <ProfileHeader />

      <div className="flex flex-wrap gap-10 mt-[2.8125rem]">
        <MoonBeams />

        <MyBadges />

        <DailyCheckIn />

        <Invite />
      </div>
      
      <MyNFT />

      <EventsParticipated />
    </section>
  );
}
