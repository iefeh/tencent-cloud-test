import { NFTItem } from '@/http/services/mint';
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
import { useContext, useEffect, useState } from 'react';

function getMergedNFT() {
  return {
    chain_id: '80001',
    token_id: 43,
    block_number: 46641675,
    confirmed_time: 1709542050421,
    transaction_id: '0x26c481b2a4799e5280c3ada3c68b3b843bd588748d3356712f089464f1e2ce37',
    transaction_status: 'confirmed',
    token_metadata: {
      name: 'Destiny TETRA NFT #43',
      animation_url: 'https://cloudflare-ipfs.com/ipfs/bafybeidpyjgki6yt6gzo3qwsf6tl24q67t6fyjkrzyscm5dma4qulcnpva',
    },
  };
}

function NFTMergePage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { userInfo } = useContext(MobxContext);
  const MAX_MERGE_LEN = 4;
  const [nfts, setNFTs] = useState<(NFTItem | null)[]>([]);
  const [canMint, setCanMint] = useState(false);
  const [mergeLoading, setMergeLoading] = useState(false);
  const [merged, setMerged] = useState(false);
  const [selectedNFTs, setSelectedNFTs] = useState<NFTItem[]>([]);
  const [mergedNFT, setMergedNFT] = useState<NFTItem | null>(null);
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

  const queryNFTs = throttle(async () => {
    const list = [
      {
        token_id: 44,
        chain_id: '80001',
        block_number: 46491562,
        confirmed_time: 1709207951540,
        transaction_id: '0xc7efad050379187e50dbcf4674f45c1782f5671d26c1cb1e359d6f85f1ec20be',
        transaction_status: 'confirmed',
        token_metadata: {
          name: 'Destiny TETRA NFT #44',
          animation_url: 'https://cloudflare-ipfs.com/ipfs/bafybeidknhvfvfr5uoozhkfj6kykocccen7ctvqonoesenpbbjstpsvgmm',
        },
      },
      {
        token_id: 5,
        chain_id: '80001',
        block_number: 46518000,
        confirmed_time: 1709265286082,
        transaction_id: '0xef6b6885a1c79907c74896d1a5cfa27707210102f74b83373f5546d66b358e53',
        transaction_status: 'confirmed',
        token_metadata: {
          name: 'Destiny TETRA NFT #5',
          animation_url: 'https://cloudflare-ipfs.com/ipfs/bafybeidswqmts7oyl5bivl7ople45mfhtovbnuixkxqbckyvzycxzpx7vm',
        },
      },
      {
        chain_id: '80001',
        token_id: 43,
        block_number: 46641675,
        confirmed_time: 1709542050421,
        transaction_id: '0x26c481b2a4799e5280c3ada3c68b3b843bd588748d3356712f089464f1e2ce39',
        transaction_status: 'confirmed',
        token_metadata: {
          name: 'Destiny TETRA NFT #43',
          animation_url: 'https://cloudflare-ipfs.com/ipfs/bafybeidpyjgki6yt6gzo3qwsf6tl24q67t6fyjkrzyscm5dma4qulcnpva',
        },
      },
      {
        chain_id: '80001',
        token_id: 43,
        block_number: 46641675,
        confirmed_time: 1709542050421,
        transaction_id: '0x26c481b2a4799e5280c3ada3c68b3b843bd588748d3356712f089464f1e2ce38',
        transaction_status: 'confirmed',
        token_metadata: {
          name: 'Destiny TETRA NFT #43',
          animation_url: 'https://cloudflare-ipfs.com/ipfs/bafybeidpyjgki6yt6gzo3qwsf6tl24q67t6fyjkrzyscm5dma4qulcnpva',
        },
      },
    ];

    if (merged) {
      list.push(getMergedNFT());
    }

    if (list.length < 9) {
      list.push(...Array(9 - list.length).fill(null));
    }

    setNFTs(list);
  }, 500);

  function onToggleNFT(item: NFTItem | null, selected: boolean) {
    if (!item) return;

    let list = selectedNFTs.slice();
    if (!selected) {
      list = list.filter((nft) => nft.transaction_id !== item.transaction_id);
    } else if (selectedNFTs.length < MAX_MERGE_LEN) {
      list.push(item);
    }

    setSelectedNFTs(list);
    setCanMint(list.length === MAX_MERGE_LEN);
  }

  const onMerge = throttle(async () => {
    setMergeLoading(true);
    onClose();

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setMergeLoading(false);
    setMergedNFT(getMergedNFT());
    setMerged(true);
  }, 500);

  useEffect(() => {
    queryNFTs();
  }, [userInfo]);

  return (
    <section id="luxy">
      <Head>
        <title>Merge NFT | Moonveil Entertainment</title>
      </Head>

      <div className="w-full pl-[6.875rem] pr-20 flex flex-col items-center md:flex-row md:items-start gap-[4.375rem] mt-[10.25rem] mb-[7.25rem]">
        <div className="w-[50rem] h-[50rem] flex flex-col bg-[url('/img/nft/merge/bg_content.png')] bg-contain border-1 border-basic-yellow rounded-md px-[1.875rem] relative">
          <div className="flex-1 flex flex-col justify-center items-center">
            {mergeLoading ? null : merged ? (
              <>
                <div className="w-[35.8125rem] h-[35.8125rem]">
                  {mergedNFT?.token_metadata?.animation_url && (
                    <Video
                      options={{
                        controls: false,
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
                  <LGButton label="Check NFT" link="/Profile/MyAssets" target="_blank" actived />
                  <LGButton label="Merge History" />
                </div>
              </>
            ) : (
              <>
                <p>
                  {userInfo
                    ? 'Please select the FOUR Destiny TETRA NFTs you want to merge.'
                    : 'Please log in to check your NFT'}
                </p>
                <LGButton className="mt-11" label="Merge Now" disabled={!canMint} linearDisabled onClick={onOpen} />
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

        <div className="flex-1 h-[50rem] flex flex-col">
          <div className="flex justify-between items-center shrink-0">
            <div className="font-semakin text-3xl bg-clip-text bg-[linear-gradient(270deg,#EDE0B9_0%,#CAA67E_100%)] text-transparent">
              My Assets( 9 )
            </div>

            <Link className="text-basic-yellow" href="/Profile/MyAssets" target="_blank">
              More Assets &gt;&gt;
            </Link>
          </div>

          <div className="w-full grid grid-cols-3 gap-3 flex-1 overflow-y-auto mt-6">
            {nfts.map((item, index) => (
              <MergeNFT
                key={item ? `id_${item.transaction_id}` : `index_${index}`}
                src={item?.token_metadata?.animation_url}
                showSelection
                onSelectChange={(selected) => onToggleNFT(item, selected)}
              />
            ))}
          </div>
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
