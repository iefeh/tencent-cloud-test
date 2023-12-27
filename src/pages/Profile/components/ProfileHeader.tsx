import UserProfile from '@/pages/components/common/UserProfile';
import editImg from 'img/profile/edit.png';
import shareImg from 'img/profile/share.png';
import IconLink from '@/pages/components/common/buttons/IconLink';

export default function ProfileHeader() {
  return (
    <div className="w-full flex justify-between items-center">
      <UserProfile />

      <span>
        <IconLink icon={editImg} label="Edit" />
        <IconLink icon={shareImg} label="Share" />
      </span>
    </div>
  );
}
