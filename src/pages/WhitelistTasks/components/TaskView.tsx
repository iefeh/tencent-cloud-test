import PageDesc from '@/pages/components/common/PageDesc';
import JoinTaskList from './JoinTaskList';
import IncreaseTaskList from './IncreaseTaskList';

export default function TaskView() {
  return (
    <div className="task-list w-[64.5%] ml-auto pt-[12.75rem] pl-[3.75rem]">
      <PageDesc
        className="items-start text-left"
        title={<div className="font-semibold text-5xl">Destiny Tetra NFT Whitelist Tasks</div>}
        subtitle={
          <div className="font-poppins text-base max-w-[54.875rem] mt-9">
            Participating in the following tasks will give you the opportunity to be whitelisted for a Level-I Destiny
            Tetra NFT.
            <br />
            Time: August 10th, 12:00 UTC - August 15th, 12:00 UTC
          </div>
        }
      />

      <div className="separator mt-[5.3875rem] mb-[4.8125rem]"></div>

      <JoinTaskList />

      <IncreaseTaskList />
    </div>
  );
}
