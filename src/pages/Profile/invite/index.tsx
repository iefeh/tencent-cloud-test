import Head from 'next/head';
import AutoBreadcrumbs from '@/pages/components/common/AutoBreadcrumbs';
import InviteCard from '../../../components/profile/invite/InviteCard';
import MBProgress from '../../../components/profile/invite/MBProgress';
import InviteesTabs from '@/components/profile/invite/InviteesTabs';
import RewardHistory from '@/components/profile/invite/RewardHistory';
import { createContext } from 'react';
import InviteStore, { useInviteStore } from '@/store/Invite';

export const InviteContext = createContext(new InviteStore());

export default function ProfileEditPage() {
  const inviteStore = useInviteStore();

  inviteStore.init();

  return (
    <section
      id="luxy"
      className="w-full flex flex-col px-8 lg:px-[16.25rem] pt-[9.125rem] pb-[13.5rem] mx-auto min-h-screen bg-[url('/img/profile/bg.png')] bg-contain bg-top bg-no-repeat"
    >
      <Head>
        <title>Invite New Users | Moonveil Entertainment</title>
      </Head>

      <AutoBreadcrumbs hrefs={['/Profile']} />

      <InviteContext.Provider value={inviteStore}>
        <div className="max-w-[75rem] mx-auto mt-10">
          <InviteCard />

          <MBProgress />

          <div className="flex gap-10 mt-16">
            <InviteesTabs />

            <RewardHistory />
          </div>
        </div>
      </InviteContext.Provider>
    </section>
  );
}
