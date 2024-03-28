import Head from 'next/head';
import AutoBreadcrumbs from '@/pages/components/common/AutoBreadcrumbs';
import InviteCard from './InviteCard';
import MBProgress from './MBProgress';

export default function ProfileEditPage() {
  return (
    <section
      id="luxy"
      className="w-full flex flex-col px-8 lg:px-[16.25rem] pt-[9.125rem] pb-[13.5rem] mx-auto min-h-screen bg-[url('/img/profile/bg.png')] bg-contain bg-top bg-no-repeat"
    >
      <Head>
        <title>Invite New Users | Moonveil Entertainment</title>
      </Head>

      <AutoBreadcrumbs hrefs={['/Profile']} />

      <div className="max-w-[75rem] mx-auto mt-10">
        <InviteCard />

        <MBProgress />
      </div>
    </section>
  );
}
