import BasicButton from '@/pages/components/common/BasicButton';
import PageDesc from '@/pages/components/common/PageDesc';
import Image from 'next/image';
import inactiveTrifleImg from 'img/nft/trifle/trifle_inactive.jpg';
import activeTrifleImg1 from 'img/nft/trifle/trifle_active_1.jpg';
import arrowImg from 'img/nft/trifle/arrow.png';

export default function TrifleScren() {
  const trifles = [
    {
      title: 'Destiny Tetra',
      label: 'Level I',
      activeImg: activeTrifleImg1,
      isActive: true,
    },
    {
      title: 'Eternity Tetra',
      label: 'Level II',
      // TODO 替换二阶激活图片
      activeImg: activeTrifleImg1,
      isActive: false,
    },
    {
      title: 'Infinity Tetra',
      label: 'Level III',
      // TODO 替换三阶激活图片
      activeImg: activeTrifleImg1,
      isActive: false,
    },
  ];

  return (
    <div className="w-full h-screen bg-black flex flex-col justify-center items-center shadow-[0_-4rem_4rem_4rem_#000]">
      <PageDesc
        title="Collect, Sythesize and Upgrade"
        subtitle={
          <div className="w-[54rem] font-decima text-lg">
            Our creative gameplay of Tetra NFT Series is to collect, synthesize and upgrade. A higher level of Tetra NFT
            ownership means more rights, rewards, and influence in our ecosystem, and also means greater
            responsibilities to our community.
          </div>
        }
      />

      <div className="font-semakin text-basic-yellow text-[1.75rem] mt-24">We have three levels of Tetra NFTs</div>

      <div className="px-10 py-4 border border-[#3E3123] rounded-[0.625rem] bg-[rgba(246,199,153,0.06)] mt-[1.875rem] font-decima text-base">
        Collect multiple Level I Destiny Tetra NFTs to synthesize and upgrade to higher level NFTs.
      </div>

      <div className="mystery-box-list flex justify-between items-center">
        {trifles.map((item, index) => {
          return (
            <>
              {index > 0 && <Image className="w-7 h-[3.1875rem]" src={arrowImg} alt="" />}

              <div className="mystery-box">
                <div className="bg"></div>
                <div className="box">
                  <Image
                    className={
                      'w-[18.75rem] h-[18.75rem] border rounded-[1.25rem] ' +
                      (item.isActive ? 'border-[rgba(75,217,214,0.6)]' : 'border-[rgba(255,255,255,0.5)]')
                    }
                    src={item.isActive ? item.activeImg : inactiveTrifleImg}
                    alt=""
                  />
                </div>
              </div>
            </>
          );
        })}
      </div>

      <BasicButton className="mt-[5.25rem]" label="Get Involved" link="/WhitelistTasks" />
    </div>
  );
}
