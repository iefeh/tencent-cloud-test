import Image from 'next/image';
import tagImg from 'img/nft/trifle/tag.png';
import { Privileges, TrifleCards } from '../constant/card';

interface Props {
  step: number;
}

export default function PrivilegeList(props: Props) {
  const { step } = props;
  const minLimit = TrifleCards.findLast((item) => item.isActive)?.privilegeLimitRow || -1;

  return (
    <div className="privilege-list w-full">
      {Privileges.map((p, index) => {
        const { privilegeLimitRow: limit, isActive } = TrifleCards[step];
        if (limit !== -1 && index > limit) return;
        const isMask = !isActive && index > minLimit;

        return (
          <div
            key={index}
            className={'flex items-center mt-[1.375rem] transition-all ' + (limit !== -1 && index > limit ? 'hidden' : '')}
          >
            <div className="tag w-[0.375rem] h-4 relative">
              <Image src={tagImg} alt="" fill />
            </div>

            <div className="content flex items-center text-base ml-[0.5625rem] whitespace-normal">
              <div className="index font-poppins-medium w-5 flex-shrink-0">{(index + 1 + '').padStart(2, '0')}.</div>

              <div className={'text font-poppins ml-[1.875rem] break-all ' + (isMask ? 'blur-sm' : '')}>
                {isMask ? Array(p.length).fill('*').join('') : p}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
