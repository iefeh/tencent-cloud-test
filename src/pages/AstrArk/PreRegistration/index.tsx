import IndexScreen from '@/components/pages/astrark/preregistration/IndexScreen';
import Head from 'next/head';
import KVScreen from '@/components/pages/astrark/preregistration/KVScreen';
import FeatureScreen from '@/components/pages/astrark/preregistration/FeatureScreen';
import { PreRegisterInfoDTO, queryPreRegisterInfoAPI } from '@/http/services/astrark';
import { useContext, useEffect, useState } from 'react';
import { throttle } from 'lodash';
import { MobxContext } from '@/pages/_app';
import { observer } from 'mobx-react-lite';
import FloatDownloadButton from '@/components/pages/astrark/home/FloatDownloadButton';

function PreRegistrationPage() {
  const { userInfo } = useContext(MobxContext);
  const [preInfo, setPreInfo] = useState<PreRegisterInfoDTO | null>(null);

  const queryPreRegisterInfo = throttle(async () => {
    try {
      const res = await queryPreRegisterInfoAPI();
      setPreInfo(res || null);
    } catch (error) {
      console.log(error);
    }
  }, 500);

  useEffect(() => {
    queryPreRegisterInfo();
  }, [userInfo]);

  return (
    <>
      <section id="luxy" className="scroll-wrapper w-full relative flex flex-col z-10">
        <Head>
          <title>Pre-Registration | Moonveil Entertainment</title>
        </Head>

        <IndexScreen preInfo={preInfo} onPreRegistered={queryPreRegisterInfo} />

        {/* <KVScreen /> */}

        <FeatureScreen />

        {/* <FloatDownloadButton /> */}
      </section>
    </>
  );
}

export default observer(PreRegistrationPage);
