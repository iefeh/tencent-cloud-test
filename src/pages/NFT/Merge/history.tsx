import { MergeListItem, queryMergeListAPI } from '@/http/services/mint';
import PaginationRenderItem from '@/pages/LoyaltyProgram/earn/components/TaskTabs/components/PaginationRenderItem';
import { MobxContext } from '@/pages/_app';
import AutoBreadcrumbs from '@/pages/components/common/AutoBreadcrumbs';
import CircularLoading from '@/pages/components/common/CircularLoading';
import { Pagination } from '@nextui-org/react';
import { debounce } from 'lodash';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import Image from 'next/image';
import { useContext, useEffect, useRef, useState } from 'react';
import teamsImg from 'img/loyalty/task/teams.png';
import Video from '@/pages/components/common/Video';
import NFT from '@/pages/components/common/nft/NFT';
import dayjs from 'dayjs';

function NFTMergeHistoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { userInfo } = useContext(MobxContext);
  const [loading, setLoading] = useState(false);
  const pagiInfo = useRef<PagiInfo>({
    pageIndex: 1,
    pageSize: 10,
  });
  const [pagiTotal, setPagiTotal] = useState(0);
  const [list, setList] = useState<MergeListItem[]>([]);

  const queryHistories = debounce(async function (pagi: PagiInfo = pagiInfo.current, noLoading = false) {
    if (!noLoading) setLoading(true);

    try {
      const { pageIndex, pageSize } = pagi;
      const res = await queryMergeListAPI({ page_num: pageIndex, page_size: pageSize });
      const { merges, total } = res;
      Object.assign(pagiInfo.current, pagi);
      setPagiTotal(Math.ceil((+total || 0) / pageSize));
      setList(merges || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  });

  function onPagiChange(page: number) {
    if (page === pagiInfo.current.pageIndex) return;

    const pagi = { ...pagiInfo.current, pageIndex: page };
    queryHistories(pagi);
  }

  useEffect(() => {
    if (!userInfo) {
      setList([]);
      return;
    }

    queryHistories();
  }, [userInfo]);

  return (
    <section
      id="luxy"
      className="w-full flex flex-col px-8 lg:px-[16.25rem] pt-[12.5rem] pb-[16rem] mx-auto min-h-screen bg-[url('/img/profile/bg.png')] bg-[length:100%_auto] bg-no-repeat"
    >
      <Head>
        <title>Merge History | Moonveil Entertainment</title>
      </Head>

      <AutoBreadcrumbs hrefs={['/Profile']} />

      <div className="w-full mt-16 flex flex-col justify-between min-h-[25rem] max-h-screen">
        <div className="font-semakin text-basic-yellow text-3xl">Merge History</div>

        <div className="flex-1 overflow-y-auto relative min-h-[25rem] pb-8">
          {list.length < 1 ? (
            <div className="absolute inset-0 backdrop-saturate-150 backdrop-blur-md bg-overlay/30 z-[999] flex flex-col justify-center items-center font-poppins text-2xl">
              <p>More exciting events coming soon.</p>
              <Image className="w-[54rem] h-auto" src={teamsImg} alt="" />
            </div>
          ) : (
            list.map((item) => {
              let confirmedTime = '--';

              if (item.confirmed_time) {
                try {
                  confirmedTime = dayjs(item.confirmed_time).format('YYYY-MM-DD HH:mm:ss');
                } catch (error) {}
              }

              return (
                <div
                  key={item.token_id}
                  className="flex gap-10 mt-8 border-1 border-[#1e1a17] rounded-sm px-16 bg-black"
                >
                  <div className="pr-8 w-80 border-r-1 border-r-[#1e1a17] py-12">
                    <div className="text-[#999]">Acquired</div>

                    <div className="mt-6">
                      {item.token_metadata && (
                        <div className="flex flex-col items-start">
                          <NFT className="!w-36 !h-36" src={item.token_metadata.animation_url} withControls={false} />

                          <p className="text-xl font-semakin text-basic-yellow mt-4">{item.token_metadata.name}</p>

                          <p className="mt-2">{confirmedTime}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="py-12">
                    <div className="text-[#999]">Merged By</div>

                    <div className="flex mt-6">
                      {item.request_token_metadata.map((nft, nftIndex) => (
                        <div key={nftIndex} className="max-w-[10rem]">
                          <NFT className="!w-36 !h-36" src={nft?.animation_url} withControls={false} />

                          <p className="mt-4">{nft?.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {loading && <CircularLoading />}
        </div>

        <div className="flex justify-center mt-8">
          <Pagination
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
        </div>
      </div>
    </section>
  );
}

export default observer(NFTMergeHistoryPage);
