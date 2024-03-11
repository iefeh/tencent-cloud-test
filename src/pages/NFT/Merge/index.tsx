import { NFTItem, queryLatestMergeReqAPI, queryMyNFTListAPI } from '@/http/services/mint';
import { MobxContext } from '@/pages/_app';
import CircularLoading from '@/pages/components/common/CircularLoading';
import Video from '@/pages/components/common/Video';
import LGButton from '@/pages/components/common/buttons/LGButton';
import MergeNFT from '@/pages/components/common/nft/MergeNFT';
import { Modal, ModalBody, ModalContent, ModalFooter, useDisclosure } from '@nextui-org/react';
import { throttle } from 'lodash';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import Link from 'next/link';
import { useContext, useEffect, useRef, useState } from 'react';
import BetterScroll from 'better-scroll';
import Pullup from '@better-scroll/pull-up';
import Pulldown from '@better-scroll/pull-down';
import MouseWheel from '@better-scroll/mouse-wheel';
import useMint from '@/hooks/useMint';

BetterScroll.use(MouseWheel);
BetterScroll.use(Pullup);
BetterScroll.use(Pulldown);

function NFTMergePage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { userInfo } = useContext(MobxContext);
  const MAX_MERGE_LEN = 4;
  const MIN_NFT_COUNT = 9;

  function getBasePageInfo() {
    return { page_num: 1, page_size: MIN_NFT_COUNT };
  }

  const [nfts, setNFTs] = useState<(NFTItem | null)[]>(Array(MIN_NFT_COUNT).fill(null));
  const [canMerge, setCanMerge] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mergeLoading, setMergeLoading] = useState(false);
  const [merged, setMerged] = useState(false);
  const [selectedNFTs, setSelectedNFTs] = useState<NFTItem[]>([]);
  const [mergedNFT, setMergedNFT] = useState<NFTItem | null>(null);
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const pageInfo = useRef<PageQueryDto>(getBasePageInfo());
  const [total, setTotal] = useState(0);
  const loadFinishedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bsRef = useRef<BetterScroll | null>(null);
  const { verifyMerge, merge } = useMint();
  const loopTimer = useRef(0);

  const queryNFTs = async () => {
    setLoading(true);
    let list: (NFTItem | null)[] = [];
    let totalCount = 0;

    try {
      const res = await queryMyNFTListAPI(pageInfo.current);
      list = pageInfo.current.page_num === 1 ? [] : nfts;
      list.push(...(res?.nfts || []));
      totalCount = res?.total || 0;
    } catch (error) {}

    if (list.length < MIN_NFT_COUNT) {
      list.push(...Array(MIN_NFT_COUNT - list.length).fill(null));
    }

    setNFTs(list);
    setTotal(totalCount);
    setLoading(false);
    loadFinishedRef.current = list.length >= totalCount;
  };

  const queryLatestMergeNFT = async (isRefresh = false) => {
    const res = await queryLatestMergeReqAPI({ tx_id: mergedNFT?.transaction_id });
    const nft = res?.merge || null;

    if (nft) {
      if (nft.status === 'requesting') {
        setMergeLoading(true);
        setMerged(false);
      } else if (nft.status === 'merged') {
        setMergeLoading(false);
        setMerged(true);

        // 已合并状态取消轮询
        if (loopTimer.current) {
          clearTimeout(loopTimer.current);
        }
      }
    } else {
      setLoading(false);
      setMerged(false);
    }

    setMergedNFT(nft);
  };

  function startQueryLoop() {
    if (loopTimer.current) {
      clearTimeout(loopTimer.current);
    }

    queryLatestMergeNFT();
    loopTimer.current = window.setInterval(queryLatestMergeNFT, 60000);
  }

  function onToggleNFT(item: NFTItem | null, selected: boolean) {
    if (!item || (selected && selectedNFTs.length >= MAX_MERGE_LEN) || merged || mergeLoading) return false;

    let list = selectedNFTs.slice();
    if (!selected) {
      list = list.filter((nft) => nft.transaction_id !== item.transaction_id);
    } else {
      if (selectedNFTs.length > 0) {
        const itemNFTType = `${item.chain_id}_${item.contract_address}`;
        const existedNFTType = `${selectedNFTs[0].chain_id}_${selectedNFTs[0].contract_address}`;

        if (itemNFTType !== existedNFTType) return false;
      }

      list.push(item);
    }

    setSelectedNFTs(list);
    setCanMerge(list.length === MAX_MERGE_LEN);
    return true;
  }

  const onMergeClick = throttle(async () => {
    const res = await verifyMerge();
    if (!res) return;

    onOpen();
  }, 500);

  const onMerge = throttle(async () => {
    setMergeLoading(true);
    onClose();

    const ids = selectedNFTs.map((item) => item.token_id);
    await merge(ids);
    setSelectedNFTs([]);
    setNFTs([]);
    pageInfo.current.page_num = 1;
    queryNFTs();
    startQueryLoop();
  }, 500);

  const onPullUp = async () => {
    if (loadFinishedRef.current) return;
    pageInfo.current.page_num++;
    await queryNFTs();
    bsRef.current?.finishPullUp();
    bsRef.current?.refresh();
  };

  const onPulldown = async () => {
    loadFinishedRef.current = false;
    pageInfo.current.page_num = 1;
    await queryNFTs();
    bsRef.current?.finishPullDown();
    bsRef.current?.refresh();
  };

  function onMergeMore() {
    setLoading(false);
    setMerged(false);
    setMergedNFT(null);
  }

  useEffect(() => {
    queryNFTs();
    if (userInfo) queryLatestMergeNFT(true);
  }, [userInfo]);

  useEffect(() => {
    if (!scrollRef.current) return;

    bsRef.current = new BetterScroll(scrollRef.current, {
      probeType: 3,
      pullUpLoad: true,
      pullDownRefresh: true,
      mouseWheel: true,
    });

    bsRef.current.on('pullingUp', onPullUp);
    bsRef.current.on('pullingDown', onPulldown);

    return () => {
      bsRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    setSelectedNFTs([]);
  }, [merged, mergeLoading]);

  return (
    <section id="luxy">
      <Head>
        <title>Merge NFT | Moonveil Entertainment</title>
      </Head>

      <div className="w-full pl-[6.875rem] pr-20 flex flex-col items-center xl:flex-row xl:items-start gap-[4.375rem] mt-[10.25rem] mb-[7.25rem]">
        <div className="w-[50rem] h-[50rem] flex flex-col bg-[url('/img/nft/merge/bg_content.png')] bg-contain border-1 border-basic-yellow rounded-md px-[1.875rem] relative">
          <div className="flex-1 flex flex-col justify-center items-center">
            {mergeLoading ? null : merged ? (
              <>
                <div className="w-[35.8125rem] h-[35.8125rem]">
                  {mergedNFT?.token_metadata?.animation_url && (
                    <Video
                      key={mergedNFT.token_metadata.animation_url}
                      className="w-full h-full"
                      options={{
                        sources: [
                          {
                            src: mergedNFT.token_metadata.animation_url,
                            type: 'video/webm',
                          },
                        ],
                      }}
                    />
                  )}
                </div>

                <p className="text-base text-center w-[39rem]">
                  Congratulations on receiving your Eternity TETRA NFT, please check the unique identification number of
                  each TETRA NFT from the{' '}
                  <Link href="/Profile" target="_blank" className="uppercase text-basic-yellow underline">
                    USER CENTER
                  </Link>
                  .
                </p>

                <div className="flex justify-center pt-12 gap-2">
                  <LGButton label="Merge More" actived onClick={onMergeMore} />
                  <LGButton label="Merge History" link="/NFT/Merge/history" />
                </div>
              </>
            ) : (
              <>
                <p>
                  {userInfo
                    ? 'Please select the FOUR Destiny TETRA NFTs you want to merge.'
                    : 'Please log in to check your NFT'}
                </p>
                <LGButton
                  className="mt-11"
                  label="Merge Now"
                  disabled={!canMerge}
                  linearDisabled
                  onClick={onMergeClick}
                />
              </>
            )}
          </div>

          {!merged && (
            <div className="shrink-0">
              <p className="text-[#999] mb-8">
                {mergeLoading ? (
                  <>
                    The merging process will take about <span className="text-basic-yellow">5 minutes</span>. Please do
                    not refresh or close the page. Thank you for your patience.
                  </>
                ) : (
                  <>
                    <span className="text-white">Kind reminder: </span>Lv2 Eternity TETRA will be merged on the Ethereum
                    network. To ensure a smooth experience for you, we will cover all the ETH Gas Fees required for
                    minting on Ethereum.
                  </>
                )}
              </p>
            </div>
          )}

          {mergeLoading && <CircularLoading noBlur />}
        </div>

        <div className="flex-1 flex flex-col relative">
          <div className="flex justify-between items-center shrink-0">
            <div className="font-semakin text-3xl bg-clip-text bg-[linear-gradient(270deg,#EDE0B9_0%,#CAA67E_100%)] text-transparent">
              My Assets( {total} )
            </div>

            <Link className="text-basic-yellow" href="/Profile/MyAssets" target="_blank">
              More Assets &gt;&gt;
            </Link>
          </div>

          <div ref={scrollRef} className="w-full h-[47.25rem] overflow-hidden mt-6">
            <div className="w-full grid grid-cols-3 gap-3 flex-1">
              {nfts.map((item, index) => (
                <MergeNFT
                  key={item ? `id_${item.token_id}_${item.transaction_id}` : `index_${index}`}
                  src={item?.token_metadata?.animation_url}
                  status={item?.transaction_status}
                  showSelection
                  onSelectChange={(selected) => onToggleNFT(item, selected)}
                />
              ))}
            </div>
          </div>

          {loading && <CircularLoading />}
        </div>

        <Modal
          isOpen={isOpen}
          classNames={{
            base: 'w-[31.25rem] px-16 pt-14 pb-12',
            body: 'p-0',
            footer: 'flex justify-center p-0 pt-10',
          }}
          onOpenChange={onOpenChange}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalBody>
                  <p className="text-base text-white text-center">
                    You have selected FOUR Destiny TETRA NFTs for merging. Please note that this process is
                    irreversible. Are you sure you want to continue?
                  </p>
                </ModalBody>

                <ModalFooter>
                  <LGButton label="Yes" onClick={onMerge} />
                  <LGButton label="No" actived onClick={onClose} />
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </section>
  );
}

export default observer(NFTMergePage);
