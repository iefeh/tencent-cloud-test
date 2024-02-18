import Image from 'next/image';
import rewardImg from 'img/loyalty/task/reward.png';
import rewardBgImg from 'img/loyalty/task/bg_reward.png';
import { FullEventItem } from '@/http/services/task';

interface Props {
  item?: FullEventItem;
}

export default function Rewards(props: Props) {
  const { item } = props;

  return (
    <div className="mt-[1.875rem]">
      <div className="font-semakin text-xl text-basic-yellow">Rewards</div>

      <div className="border-1 border-basic-gray rounded-[0.625rem] overflow-hidden mt-[1.625rem]">
        <Image
          className="w-[25.625rem] h-[25.625rem]"
          src={item?.rewards?.[0]?.image_medium || rewardImg}
          alt=""
          width={410}
          height={410}
        />

        <div className="pt-[1.375rem] pr-[2.375rem] pb-[2.25rem] pl-[2.1875rem] w-full flex flex-col justify-between gap-5 relative border-t-1 border-basic-gray">
          <Image src={rewardBgImg} alt="" fill />
          {/* <div>{JSON.stringify(item?.claim_settings?.reward_accelerators || [])}</div> */}

          {(item?.rewards || []).map((reward, index) => (
            <div
              key={index}
              className="flex justify-between items-center font-semakin text-lg leading-none text-basic-yellow relative z-0"
            >
              <div>{reward.name}</div>
              <div className="flex items-center gap-1">
                {reward.image_small && (
                  <div className="w-6 h-6 relative">
                    <Image className="object-contain" src={reward.image_small} alt="" fill />
                  </div>
                )}
                <span>{reward.type === 'moon_beam' ? `${reward.amount || 0} MBS` : reward.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
