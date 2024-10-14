import Head from 'next/head';
import { FC, useState } from 'react';
import gyozaComp from "@/components/pages/gyoza"
import { GyozaTabsEnum } from '@/components/pages/gyoza/GyozaTabs';
import S3Image from '@/components/common/medias/S3Image';
import { cn } from '@nextui-org/react';
const { GyozaHome, GuidePage, GyozaTabs, TabContents } = gyozaComp;

const getUrl = (name: string) => {
  return `/minigames/miner/${name}.png`
}

const bgImgList = [
  { url: getUrl('cannon'), classNames: 'w-[37.3125rem] h-[27.5rem] top-[8.0625rem] right-0' },
  { url: getUrl('castle'), classNames: 'w-[867px] h-[40.625rem] bottom-0 left-0' },
]

const GyozaPage: FC & BasePage = () => {
  const [tabkeys, setTabkeys] = useState<GyozaTabsEnum>(GyozaTabsEnum.Overview)
  const [showGuide, setShowGuide] = useState(true)

  return (
    <section className="font-jcyt6 w-screen h-screen">
      <Head>
        <link
          rel="preload"
          as="font"
          href="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/fonts/jiangchengyuanti600W.ttf"
          crossOrigin="anonymous"
        ></link>
      </Head>

      <GyozaHome showMask>
        {showGuide
          ? <GuidePage toSkip={() => { setShowGuide(false) }}></GuidePage>
          : (
            <div className='pt-[5.5625rem] w-[87.5rem] mx-auto'>
              {bgImgList.map((img, index) => (
                <S3Image key={index} src={img.url} className={cn([
                  img.classNames,
                  'absolute object-contain z-[-1]'
                ])} />
              ))}

              <GyozaTabs
                value={tabkeys}
                onSelectionChange={(key) => setTabkeys(key as GyozaTabsEnum)}
              ></GyozaTabs>

              <TabContents tabKey={tabkeys}></TabContents>
            </div>
          )
        }
      </GyozaHome>

    </section>
  );
};

GyozaPage.hasNavMask = true;

export default GyozaPage;
