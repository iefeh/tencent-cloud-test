import { type MyTokensRecord, queryMyTokensListAPI, NodeTokensRecord } from '@/http/services/token';
import CircularLoading from '@/pages/components/common/CircularLoading';
import { useUserContext } from '@/store/User';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import { FC, useEffect, useRef, useState } from 'react';
import teamsImg from 'img/loyalty/task/teams.png';
import NodeTable from './NodeTable';

const MyNodeWhitelist: FC = () => {
  const { userInfo } = useUserContext();

  const [tabs, setTabs] = useState<string[]>([]);

  const [items, setItems] = useState<MyTokensRecord[]>([]);
  const pagiInfo = useRef<PagiInfo>({ pageIndex: 1, pageSize: 10 });
  const [loading, setLoading] = useState(false);

  async function queryItems(pagi = pagiInfo.current, tab = 'node') {
    const { pageIndex, pageSize } = pagi;
    const data = { page_num: pageIndex, page_size: pageSize, source_type: tab };

    setLoading(true);

    try {
      const res = await queryMyTokensListAPI(data);
      const { items, source_types } = res;

      const list = source_types || [];
      setTabs(list.filter((item) => item !== 'quest'));

      Object.assign(pagiInfo.current, pagi);
      setItems(items || []);
    } catch (error: any) {
      console.log(error);
    }

    setLoading(false);
  }

  function initData() {
    setItems([]);
    Object.assign(pagiInfo.current, { pageIndex: 1, pageSize: 10 });
  }

  useEffect(() => {
    if (!userInfo) {
      initData();
      return;
    }

    queryItems();
  }, [userInfo]);

  const emptyContent = (
    <div className="relative backdrop-saturate-150 backdrop-blur-md bg-overlay/30 z-[999] flex flex-col justify-center items-center font-poppins text-2xl pointer-events-none">
      <p>No history found.</p>
      <Image className="w-[54rem] h-auto" src={teamsImg} alt="" />
    </div>
  );

  return (
    <>
      <div className="mt-16 font-semakin text-2xl text-basic-yellow">My Node Whitelist</div>

      <div className="mt-4 min-h-[16rem] w-full relative">
        {tabs.length > 0 && <NodeTable items={items as NodeTokensRecord[]} loading={loading} />}

        {loading && <CircularLoading />}

        {!loading && tabs.length < 1 && emptyContent}
      </div>
    </>
  );
};

export default observer(MyNodeWhitelist);
