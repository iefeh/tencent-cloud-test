import UserProfile from '@/pages/components/common/UserProfile';
import editImg from 'img/profile/edit.png';
import shareImg from 'img/profile/share.png';
import IconLink from '@/pages/components/common/buttons/IconLink';
import { useRouter } from 'next/router';

export default function ProfileHeader() {
  const router = useRouter();

  function onEditClick() {
    router.push('/Profile/edit');
  }

  return (
    <div className="w-full flex justify-between items-center">
      <UserProfile avatarClassName="w-[6.875rem] h-[6.875rem]" walletClassName="mt-4" />

      <span>
        <IconLink icon={editImg} label="Edit" onClick={onEditClick} />
        <IconLink icon={shareImg} label="Share" />
      </span>
    </div>
  );
}
