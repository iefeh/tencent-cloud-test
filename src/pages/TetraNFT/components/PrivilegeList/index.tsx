import Image from 'next/image';
import tagImg from 'img/nft/trifle/tag.png';

interface Props {
  step: number;
}

export default function PrivilegeList(props: Props) {
  const { step } = props;
  const privileges = [
    // level i
    'Join the private VIP Discord channel',
    'Early access to future events',
    'A certain amount of free token airdrop',
    'Offline event VIP hospitality rights',
    'Guaranteed Beta test right of future games produced by Moonveil',
    'Holders can claim free BattlePass',
    'Lifetime ingame discount',
    'Special in-game props airdrop',
    // level ii
    'Join the private VIP Discord channel',
    'Early access to future events',
    'A certain amount of free token airdrop',
    'Offline event VIP hospitality rights',
    // level iii
    'Guaranteed Beta test right of future games produced by Moonveil',
    'Holders can claim free BattlePass',
    'Lifetime ingame discount',
    'Special in-game props airdrop',
  ];
  const limitIndexes = [7, 11, -1];

  return (
    <div className="privilege-list">
      {privileges.map((p, index) => {
        if (limitIndexes[step] !== -1 && index > limitIndexes[step]) return;

        return (
          <div key={index} className="flex items-center mt-[1.375rem]">
            <div className="tag w-[0.375rem] h-4 relative">
              <Image src={tagImg} alt="" fill />
            </div>

            <div className="content flex items-center text-base ml-[0.5625rem]">
              <div className="index font-poppins-medium">{(index + 1 + '').padStart(2, '0')}.</div>

              <div className="text font-poppins ml-[1.875rem]">{p}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
