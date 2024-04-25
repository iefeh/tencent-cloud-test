import PaginationRenderItem from '@/components/LoyaltyProgram/task/PaginationRenderItem';
import { MBHistoryRecord, queryMBHistoryListAPI } from '@/http/services/profile';
import AutoBreadcrumbs from '@/pages/components/common/AutoBreadcrumbs';
import { useUserContext } from '@/store/User';
import {
  Pagination,
  ScrollShadow,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
} from '@nextui-org/react';
import dayjs from 'dayjs';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FC, Key, useEffect, useRef, useState } from 'react';

const MBHistoryPage: FC = () => {
  const { userInfo } = useUserContext();
  const router = useRouter();

  const tabs = ['Regular Task', 'Event'];
  const [selectedKey, setSelectedKey] = useState(router.query.tabKey?.toString() || tabs[0]);

  const [items, setItems] = useState<MBHistoryRecord[]>([]);
  const pagiInfo = useRef<PagiInfo>({ pageIndex: 1, pageSize: 10 });
  const [pagiTotal, setPagiTotal] = useState(0);

  function onSelectionChange(key: Key) {
    const str = key.toString();
    router.replace({ pathname: '/Profile/mbhistory', query: { ...router.query, tabKey: str } }, undefined, {
      scroll: false,
    });
    setSelectedKey(str);
  }

  async function queryItems(pagi = pagiInfo.current) {
    const { pageIndex, pageSize } = pagi;
    const data = { page_num: pageIndex, page_size: pageSize };

    try {
      const res = await queryMBHistoryListAPI(data);
      const { quests, total } = res;
      Object.assign(pagiInfo.current, pagi);
      setPagiTotal(Math.ceil((+total || 0) / pageSize));
      setItems(quests || []);
    } catch (error: any) {
      // toast.error(error?.message || error);
      console.log(error);
    }
  }

  function formatTime(time: number) {
    return dayjs(time).format('YYYY-MM-DD HH:mm:ss');
  }

  function onPagiChange(page: number) {
    if (page === pagiInfo.current.pageIndex) return;

    const pagi = { ...pagiInfo.current, pageIndex: page };
    queryItems(pagi);
  }

  useEffect(() => {
    if (!userInfo) {
      setItems([]);
      setPagiTotal(0);
      Object.assign(pagiInfo.current, { pageIndex: 1, pageSize: 10 });
      return;
    }

    queryItems();
  }, [userInfo]);

  return (
    <section
      id="luxy"
      className="w-full flex flex-col px-12 md:px-32 lg:px-[16.25rem] pt-[9.125rem] pb-[13.5rem] mx-auto min-h-screen bg-[url('/img/profile/bg.png')] bg-[length:100%_auto] bg-no-repeat"
    >
      <Head>
        <title>Moon Beams History | Moonveil Entertainment</title>
      </Head>

      <AutoBreadcrumbs hrefs={['/Profile']} />

      <div className="mt-8 w-full">
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
              <ScrollShadow className="w-full h-[31.375rem] font-poppins-medium">
                <Table
                  className="mt-[1.875rem]"
                  aria-label="Events participated"
                  classNames={{
                    wrapper: 'bg-black p-0 rounded-none border-1 border-[#1E1E1E] font-poppins-medium',
                    thead: '[&>tr:last-child]:hidden [&>tr]:border-none',
                    tbody: 'pl-[2.1875rem] pr-[1.1875rem] ',
                    tr: '!rounded-none relative base-tr',
                    th: 'bg-[#111111] !rounded-none [&:first-child]:pl-[2.1875rem] [&:last-child]:pr-[2.1875rem]',
                    td: '[&:first-child]:pl-[2.1875rem] [&:last-child]:pr-[2.1875rem]',
                  }}
                >
                  <TableHeader>
                    <TableColumn>Item</TableColumn>
                    <TableColumn>Reward Type</TableColumn>
                    <TableColumn>Moon Beams</TableColumn>
                    <TableColumn>Time</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent={'Coming Soon.'}>
                    {items.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.type}</TableCell>
                        <TableCell>{row.moon_beam_delta}</TableCell>
                        <TableCell>{formatTime(row.created_time)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollShadow>

              {items.length > 0 && (
                <Pagination
                  className="flex justify-center"
                  showControls
                  total={pagiTotal}
                  initialPage={1}
                  renderItem={PaginationRenderItem}
                  classNames={{
                    wrapper: 'gap-3',
                    item: 'w-12 h-12 font-poppins-medium text-base text-white',
                  }}
                  disableCursorAnimation
                  radius="full"
                  variant="light"
                  onChange={onPagiChange}
                />
              )}
            </Tab>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default observer(MBHistoryPage);
