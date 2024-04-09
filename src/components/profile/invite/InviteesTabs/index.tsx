import { cn } from '@nextui-org/react';
import { FC } from 'react';
import { useInviteStore } from '@/store/Invite';
import { observer } from 'mobx-react-lite';

const InviteesTabs: FC = () => {
  const { milestone } = useInviteStore();

  return (
    <div className="flex-1">
      <div className="font-semakin text-2xl">Invitee&apos;s Task Progress</div>

      <div className="text-base text-[#999] mt-8">
        There are two types of referrals: <span className="text-basic-yellow">&quot;Direct Referral&quot;</span> and{' '}
        <span className="text-basic-yellow">&quot;Indirect Referral.&quot;</span> Successful direct referrals earn{' '}
        <span className="text-basic-yellow">+30 Moon Beams</span> per person, while successful indirect referrals earn{' '}
        <span className="text-basic-yellow">+5 Moon Beams</span> per person, with no upper limit.
        <br />
        More details please view <span className="text-basic-yellow underline cursor-pointer">Rules</span>.
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
            <p className="text-[#B38C55]">+{milestone?.successful_direct_invitee || 0} Users</p>
            <p className="mt-4">Successful Direct Referrals</p>
          </div>

          <div className="flex-1 shrink-0">
            <p className="text-[#B38C55]">
              +{(milestone?.direct_invitee || 0) - (milestone?.successful_direct_invitee || 0)} Users
            </p>
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
            <p className="text-[#B38C55]">+{milestone?.successful_indirect_invitee || 0} Users</p>
            <p className="mt-4">Successful Indirect Referrals</p>
          </div>

          <div className="flex-1 shrink-0">
            <p className="text-[#B38C55]">+{milestone?.successful_indirect_invitee_reward || 0} MBS</p>
            <p className="mt-4">Total MBs Earned From Indirect Invite</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default observer(InviteesTabs);
