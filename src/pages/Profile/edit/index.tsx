import Head from 'next/head';
import ProfileEdit from './components/ProfileEdit';
import SocialMediaAccounts from './components/SocialMediaAccounts';
import ConnectWallet from './components/ConnectWallet';
import AutoBreadcrumbs from '@/pages/components/common/AutoBreadcrumbs';

export default function ProfileEditPage() {
  return (
    <section
      id="luxy"
      className="w-full flex flex-col px-8 lg:px-[16.25rem] pt-[9.125rem] pb-[13.5rem] mx-auto min-h-screen bg-[url('/img/profile/bg.png')] bg-[length:100%_auto] bg-no-repeat"
    >
      <Head>
        <title>User Center | Moonveil Entertainment</title>
      </Head>

      <AutoBreadcrumbs />

      <ProfileEdit />

      <SocialMediaAccounts />

      <ConnectWallet />
    </section>
  );
}
