import { Divider, Tab, Tabs, cn } from '@nextui-org/react';
import { FC, useState } from 'react';
import InviteesGroup from '../InviteesGroup';
import { Invitee } from '@/http/services/profile';

const InviteesTabs: FC = () => {
  const [completedData, setCompletedData] = useState<Invitee[]>([]);
  const [inProgressData, setInProgressData] = useState<Invitee[]>([]);

  return (
    <div className="flex-1">
      <div className="font-semakin text-2xl">Invitee&apos;s Task Progress</div>

      <div className="text-base text-[#999] mt-8">
        There are two types of referrals: <span className="text-basic-yellow">&quot;Direct Referral&quot;</span> and{' '}
        <span className="text-basic-yellow">&quot;Indirect Referral.&quot;</span> Successful direct referrals earn{' '}
        <span className="text-basic-yellow">+30 Moon Beams</span> per person, while successful indirect referrals earn{' '}
        <span className="text-basic-yellow">+5 Moon Beams</span> per person, with no upper limit.
        <br />
        More details please view <span className="text-basic-yellow underline cursor-pointer">Rules</span>
      </div>

      <div
        className={cn([
          'w-full rounded-base border-1 border-basic-gray transition-colors',
          'hover:border-basic-yellow',
          'font-semakin text-center',
          'px-6 py-4 mt-4',
        ])}
      >
        <div className="text-2xl">Direct Referrals</div>

        <div className="flex justify-between gap-4 mt-4">
          <div className="flex-1 shrink-0">
            <p className="text-[#B38C55]">+100 Users</p>
            <p className="mt-4">Successful Direct Referrals</p>
          </div>

          <div className="flex-1 shrink-0">
            <p className="text-[#B38C55]">+100 Users</p>
            <p className="mt-4">Registration Process Incomplete</p>
          </div>
        </div>
      </div>

      <div
        className={cn([
          'w-full rounded-base border-1 border-basic-gray transition-colors',
          'hover:border-basic-yellow',
          'font-semakin text-center',
          'px-6 py-4 mt-4',
        ])}
      >
        <div className="text-2xl">Indirect Referrals</div>

        <div className="flex justify-between gap-4 mt-4">
          <div className="flex-1 shrink-0">
            <p className="text-[#B38C55]">+100 Users</p>
            <p className="mt-4">Successful Indirect Referrals</p>
          </div>

          <div className="flex-1 shrink-0">
            <p className="text-[#B38C55]">+100 Users</p>
            <p className="mt-4">Total MBs Earned From Indirect Invite</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteesTabs;
