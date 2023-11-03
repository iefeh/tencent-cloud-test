import Image from 'next/image';

import tagImg from 'img/nft/trifle/tag.png';

export default function PrivilegeList() {
  const privileges = [
    'Join the private VIP Discord channel',
    'Early access to future events',
    'A certain amount of free token airdrop',
    'Offline event VIP hospitality rights',
    'Guaranteed Beta test right of future games produced by Moonveil',
    'Holders can claim free BattlePass',
    'Lifetime ingame discount',
    'Special in-game props airdrop',
  ];

  return (
    <div className="privilege-list">
      {privileges.map((p, index) => (
        <div key={index} className="flex items-center mt-[1.375rem]">
          <div className="tag w-[0.375rem] h-4 relative">
            <Image src={tagImg} alt="" fill />
          </div>

          <div className="content flex items-center text-base ml-[0.5625rem]">
            <div className="index font-poppins-medium">{(index + 1 + '').padStart(2, '0')}.</div>

            <div className="text font-poppins ml-[1.875rem]">{p}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
