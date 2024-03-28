import { Divider, Tab, Tabs } from '@nextui-org/react';
import { FC, useState } from 'react';
import InviteesGroup from '../InviteesGroup';
import { Invitee } from '@/http/services/profile';

const InviteesTabs: FC = () => {
  const [completedData, setCompletedData] = useState<Invitee[]>([]);
  const [inProgressData, setInProgressData] = useState<Invitee[]>([]);

  return (
    <div className="flex-1">
      <div className="font-semakin text-2xl">Invitee&apos;s Task Progress</div>

      <div className="text-base text-[#999]">
        Successfully invited <span className="text-basic-yellow mt-2">7</span> people
      </div>

      <Tabs
        variant="underlined"
        classNames={{
          base: 'mt-7',
          cursor: 'w-full bg-basic-yellow',
          tab: 'text-base',
          tabContent: 'text-white hover:text-white group-data-[selected=true]:text-basic-yellow',
        }}
      >
        <Tab title="Social Media Connect" />
        <Tab title="Wallet Connect" />
      </Tabs>

      <div className="mx-10">
        <InviteesGroup className="mt-10" title="Completed" items={completedData} />

        <Divider className="my-8 bg-white/10" />

        <InviteesGroup title="In Progress" items={inProgressData} />

        <Divider className="my-8 bg-white/10" />

        <div className="text-[#999] text-sm">
          *After the invited user completes the registration of their account and binds their social account, the
          inviter will receive corresponding rewards.
          <br />
          Social account platforms that need to be linked: Twitter, Discord, Telegram
        </div>
      </div>
    </div>
  );
};

export default InviteesTabs;
