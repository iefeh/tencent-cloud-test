import Head from 'next/head';
import { Divider } from '@nextui-org/react';
import ProfileEdit from './components/ProfileEdit';
import SocialMediaAccounts from './components/SocialMediaAccounts';
import ConnectWallet from './components/ConnectWallet';

export default function ProfileEditPage() {
  return (
    <section
      id="luxy"
      className="w-full flex flex-col px-[16.25rem] pt-[9.125rem] pb-[13.5rem] mx-auto min-h-screen bg-[url('/img/profile/bg.png')] bg-[length:100%_auto] bg-no-repeat"
    >
      <Head>
        <title>User Center | Moonveil Entertainment</title>
      </Head>

      <div className="text-base">
        <span className="text-[#666666]">User Center &gt; </span>
        <span>Edit</span>
      </div>

      <Divider className="mt-[1.1875rem] bg-[rgba(255,255,255,0.1)]" />

      <ProfileEdit />

      <SocialMediaAccounts />

      <ConnectWallet />
    </section>
  );
}
