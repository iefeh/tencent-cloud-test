import Head from 'next/head';
import AutoBreadcrumbs from '@/pages/components/common/AutoBreadcrumbs';
import DisplayBadges from './components/DisplayBadges';
import MyBadges from './components/MyBadges';

export default function MyBadgesPage() {
  return (
    <section
      id="luxy"
      className="w-full flex flex-col px-8 md:px-32 lg:px-[16.25rem] pt-[9.125rem] pb-[13.5rem] mx-auto min-h-screen bg-[url('/img/profile/bg.png')] bg-[length:100%_auto] bg-no-repeat"
    >
      <Head>
        <title>My Badges | Moonveil Entertainment</title>
      </Head>

      <AutoBreadcrumbs />

      <DisplayBadges />

      <MyBadges />
    </section>
  );
}
