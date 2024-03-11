import Head from 'next/head';
import ProfileHeader from '../components/ProfileHeader';
import AutoBreadcrumbs from '@/pages/components/common/AutoBreadcrumbs';

export default function ProfilePage() {
  return (
    <section
      id="luxy"
      className="w-full flex flex-col px-8 lg:px-[16.25rem] pt-[12.5rem] pb-[16rem] mx-auto min-h-screen bg-[url('/img/profile/bg.png')] bg-[length:100%_auto] bg-no-repeat"
    >
      <Head>
        <title>User Center | Moonveil Entertainment</title>
      </Head>

      <AutoBreadcrumbs hrefs={['/Profile']} />
    </section>
  );
}
