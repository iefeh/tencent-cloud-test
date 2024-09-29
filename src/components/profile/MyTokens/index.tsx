import { type MyTokensRecord, queryMyTokensListAPI, QuestTokensRecord, NodeTokensRecord } from '@/http/services/token';
import CircularLoading from '@/pages/components/common/CircularLoading';
import { useUserContext } from '@/store/User';
import { Tab, Tabs } from '@nextui-org/react';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FC, Key, useEffect, useRef, useState } from 'react';
import teamsImg from 'img/loyalty/task/teams.png';
import QuestTable from './QuestTable';
import NodeTable from './NodeTable';

const MyTokens: FC = () => {
  const { userInfo } = useUserContext();
  const router = useRouter();

  const [tabs, setTabs] = useState<string[]>([]);
  const [selectedKey, setSelectedKey] = useState(router.query.tabKey?.toString() || tabs[0]);

  const [items, setItems] = useState<MyTokensRecord[]>([]);
  const pagiInfo = useRef<PagiInfo>({ pageIndex: 1, pageSize: 10 });
  const [pagiTotal, setPagiTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  function onSelectionChange(key: Key) {
    const str = key.toString();
    setSelectedKey(str);
    initData();
    queryItems(pagiInfo.current, str);
  }

  async function queryItems(pagi = pagiInfo.current, tab = selectedKey) {
    const { pageIndex, pageSize } = pagi;
    const data = { page_num: pageIndex, page_size: pageSize, source_type: tab };

    setLoading(true);

    try {
      const res = await queryMyTokensListAPI(data);
      const { items, total, source_types } = res;

      if (!selectedKey) {
        setTabs(source_types || []);
      }

      Object.assign(pagiInfo.current, pagi);
      setPagiTotal(Math.ceil((+total || 0) / pageSize));
      setItems(items || []);
    } catch (error: any) {
      console.log(error);
    }

    setLoading(false);
  }

  function onPagiChange(page: number) {
    if (page === pagiInfo.current.pageIndex) return;

    const pagi = { ...pagiInfo.current, pageIndex: page };
    queryItems(pagi);
  }

  function initData() {
    setItems([]);
    setPagiTotal(0);
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
    <div className="absolute inset-0 backdrop-saturate-150 backdrop-blur-md bg-overlay/30 z-[999] flex flex-col justify-center items-center font-poppins text-2xl pointer-events-none">
      <p>No history found.</p>
      <Image className="w-[54rem] h-auto" src={teamsImg} alt="" />
    </div>
  );

  return (
    <>
      <div className="mt-16 font-semakin text-2xl text-basic-yellow">My Tokens</div>

      <div className="mt-4 min-h-[32rem] w-full relative">
        {tabs.length > 0 && (
          <Tabs
            aria-label="Options"
            color="primary"
            variant="underlined"
            selectedKey={selectedKey}
            classNames={{
              base: 'w-full',
              tabList: 'gap-6 w-full relative rounded-none p-0',
              cursor: 'w-full bg-basic-yellow',
              tab: 'max-w-fit px-0 h-12 font-semakin',
              tabContent: 'text-white text-xl group-data-[selected=true]:text-basic-yellow',
              panel: 'p-0',
            }}
            onSelectionChange={onSelectionChange}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab}
                title={
                  <div className="flex items-center space-x-2">
                    <span>{tab}</span>
                  </div>
                }
              >
                {tab === 'quest' ? (
                  <QuestTable
                    loading={loading}
                    items={items as QuestTokensRecord[]}
                    pagiTotal={pagiTotal}
                    onPagiChange={onPagiChange}
                  />
                ) : tab === 'node' ? (
                  <NodeTable items={items as NodeTokensRecord[]} loading={loading} />
                ) : null}
              </Tab>
            ))}
          </Tabs>
        )}

        {loading && !selectedKey && <CircularLoading />}

        {!loading && tabs.length < 1 && emptyContent}
      </div>
    </>
  );
};

export default observer(MyTokens);
