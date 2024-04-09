import { Tab, Tabs, cn } from '@nextui-org/react';
import { FC, Fragment } from 'react';
import { useInviteStore } from '@/store/Invite';
import { InviteReferral } from '@/http/services/invite';
import Image from 'next/image';
import arrowIcon from 'img/profile/badges/icon_arrow.png';
import helpIcon from 'img/profile/badges/icon_help.png';

const RewardHistory: FC = () => {
  const { milestone } = useInviteStore();
  const { referrals } = milestone || {};

  return (
    <div className="flex-1">
      <div className="font-semakin text-2xl">Reward History</div>

      <div className="text-base text-[#999] mt-8">
        A total of <span className="text-basic-yellow font-semakin">1,000</span> Moon Beams were received from Referral
        Milestone Badges.
      </div>

      <div className="border-1 border-basic-gray rounded-base hover:border-basic-yellow transition-colors px-4 mt-4">
        <Tabs
          variant="underlined"
          classNames={{
            base: 'mt-7',
            cursor: 'w-full bg-basic-yellow',
            tab: 'text-base',
            tabContent: 'text-white hover:text-white group-data-[selected=true]:text-basic-yellow',
          }}
        >
          {(referrals || []).map((item, index) => {
            if (item.series.length < 1) return null;

            const bigIndex = item.series.findIndex((s) => !s.obtained) - 1;
            const bigSerie = item.series[Math.max(bigIndex, 0)];

            return (
              <Tab key={index} title={item.name}>
                <div className="flex flex-col items-center pt-8 pb-4 px-6">
                  <Image
                    className={cn(['w-60 h-60 object-contain', bigSerie.obtained || 'grayscale opacity-50'])}
                    src={bigSerie.image_url || helpIcon}
                    alt=""
                    width={300}
                    height={300}
                  />

                  <div className="font-semakin text-3xl mt-5 flex justify-center w-full">
                    <div className="relative bg-[linear-gradient(300deg,#EDE0B9_0%,#CAA67E_100%)] bg-clip-text text-transparent max-w-[calc(100%_-_4.25rem)] px-2">
                      {item.name || '--'}

                      <div className="font-semakin bg-[linear-gradient(300deg,#EDE0B9_0%,#CAA67E_100%)] bg-clip-text text-transparent absolute -right-[0.1875rem] bottom-0 translate-x-full text-base leading-none border-1 border-basic-gray px-1 py-[0.1875rem] rounded-[0.3125rem]">
                        LV.{bigSerie.level || '--'}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4 mt-6">
                    {item.series.map((child, childIndex) => (
                      <Fragment key={childIndex}>
                        {childIndex > 0 && item.series?.[childIndex - 1] && (
                          <Image className="w-[0.875rem] h-4 mt-7 mx-1" src={arrowIcon} alt="" width={28} height={32} />
                        )}

                        <div className="flex flex-col items-center">
                          <Image
                            className={cn([
                              'w-[4.375rem] h-[4.375rem] object-contain',
                              child.obtained && childIndex === bigIndex && 'border-1 border-basic-yellow rounded-base',
                            ])}
                            src={child.icon_url}
                            alt=""
                            width={70}
                            height={70}
                          />

                          <p
                            className={cn([
                              'font-semakin text-sm mt-3 px-1 py-[0.125rem] border-1 border-basic-gray rounded-md',
                              child.obtained &&
                                'bg-[linear-gradient(300deg,#EDE0B9_0%,#CAA67E_100%)] bg-clip-text text-transparent',
                            ])}
                          >
                            LV.{child.level || '--'}
                          </p>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                </div>
              </Tab>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
};

export default RewardHistory;
