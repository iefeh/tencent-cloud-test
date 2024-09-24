import React, { FC, useEffect, useState, useMemo } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, Button, Selection, useDisclosure } from "@nextui-org/react";
import S3Image from "@/components/common/medias/S3Image";
import { cn } from "@nextui-org/react";
import PayTable from "@/components/common/CommonTable";
import ShopItem from "../CateTabs/ShopItem";
import styles from './index.module.scss'
import type { AstrArk } from '@/types/astrark';
import { ShopItemType } from "@/constant/astrark";
import ProductCard from "./ProductCard";
import WalletModal from './WalletModal'
import useQuestInfo from "./useQuestInfo";
import PayButton from "../Buttons";
import useBuyTicket, { queryPermit } from "./useBuyTicket"
import { buyTicketPermitAPI } from "@/http/services/astrark";
import { toast } from "react-toastify";

export interface PayModalProps {
  disclosure: Disclosure;
  shopItemProps: ItemProps<AstrArk.Product>;
}

const columns = [
  {
    dataIndex: "product_usdc_price_with_discount",
    name: (
      <div>
        <div>Price</div>
        <div className="text-xs text-[rgba(245,201,141,.3)]">(USDT)</div>
      </div>
    ),
    render: (text: any, record: any) => {
      return (
        <div className="relative">
          <div>{text}</div>
          <div className="text-[.8125rem] text-center w-[4.625rem] aspect-[74/26] absolute top-[-100%] right-3 bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/shop/bg_off.png')] bg-no-repeat bg-contain">
            {record.product_price_discount * 100}% OFF
          </div>
        </div>
      )
    }
  },
  {
    dataIndex: 'product_token_price_with_discount',
    name: (
      <div>
        <div>QTY</div>
        <div className="text-xs text-[rgba(245,201,141,.3)]">(Token)</div>
      </div>
    )
  },
  {
    dataIndex: 'token_name',
    name: 'Token',
    render: (text: string, record: any) => {
      return (
        <div className="flex items-center">
          {record.icon_url
            ? <S3Image className="w-[1.625rem] h-[1.625rem] rounded-full mr-2" src={record.icon_url}></S3Image >
            : <div className="w-[1.625rem] h-[1.625rem] rounded-full bg-white mr-2"></div>
          }
          <div>{text}</div>
        </div>
      )
    }
  },
  {
    dataIndex: 'network',
    name: 'Network',
    render: (text: string, record: AstrArk.PriceToken) => {
      const { name, icon_url } = record.network
      return (
        <div className="flex items-center">
          {icon_url
            ? <S3Image className="w-[1.625rem] h-[1.625rem] rounded-full mr-2" src={icon_url}></S3Image >
            : <div className="w-[1.625rem] h-[1.625rem] rounded-full bg-white mr-2"></div>
          }
          <div>{name}</div>
        </div>
      )
    }
  },
]

const PayModal: FC<PayModalProps> = (props) => {
  const { shopItemProps, disclosure } = props;
  const { isOpen, onOpenChange } = disclosure || {};
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set<string>(["0"]));
  const walletDisclosure = useDisclosure();
  const [permit, setPermit] = useState<AstrArk.PermitRespose | null>(null);
  const { beReadyForBuyTicket } = useBuyTicket(permit, getPermit);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const { id } = shopItemProps.item || {}
      getQuestInfo(id)
    }
  }, [isOpen])

  const { questInfo, getQuestInfo, cdText } = useQuestInfo({ open: isOpen })

  async function getPermit() {
    const info = getCurSelectedKey();
    if (!info) return null;

    const { product_id = '', token_id } = info;
    const res = await queryPermit({ product_id, token_id });
    if (!!res?.reach_purchase_limit) {
      toast.error('The current purchase quantity has reached the limit.');
      return null;
    }

    if (!res?.chain_id) return null;

    setPermit(res);
    return res;
  }

  const toBuy = async () => {
    const info = getCurSelectedKey()
    const chain_id = info?.network.chain_id
    if (!chain_id) return;

    setLoading(true);
    const res = await beReadyForBuyTicket(chain_id);
    if (!res) {
      setLoading(false);
      return;
    }

    const permitRes = await getPermit();
    if (!permitRes) return;

    setTimeout(() => {
      setLoading(false);
      walletDisclosure.onOpen();
    }, 300)
  }

  const getCurSelectedKey = (): AstrArk.PriceToken | undefined => {
    const key = (selectedKeys as any)?.values()?.next()?.value
    const item = questInfo?.price_in_tokens?.[key]
    if (!item) return

    return {
      ...item,
      product_id: questInfo?.id,
    }
  }

  const compareIndex = (idx: number) => {
    const key = (selectedKeys as any)?.values()?.next()?.value
    return idx === Number(key)
  }

  const calcDisabled = () => {
    const [minutes, seconds] = cdText.split(':').map(Number);
    const totalSeconds = (minutes * 60) + seconds;

    if (totalSeconds <= 0) return true;

    if (!getCurSelectedKey()) return true;

    return false;
  }

  const renderTable = () => (
    <PayTable<AstrArk.PriceToken>
      selectedKeys={selectedKeys}
      onSelectionChange={setSelectedKeys}
      selectionMode="single"
      warpperClassNames="flex-1 h-[19.6875rem] overflow-y-auto relative px-3"
      classNames={{
        table: 'border-separate border-spacing-y-[.25rem]',
        wrapper: 'bg-transparent shadow-none p-0 ' + styles['overflow-init'],
        thead: '[&>tr:nth-child(2)]:hidden rounded-[.625rem] px-[1.375rem]',
        th: 'bg-[#081622] text-[#F5C98D] text-[1.125rem] sticky top-1 z-10 px-6 py-3',
      }}
      calcRowClassNames={(idx: number) => {
        return cn([
          "bg-black rounded-[.625rem]",
        ])
      }}
      calcCellClassNames={(idx: number, rowIdx: number) => {
        return cn([
          'border-[#2D3E4C] border-0 border-b-1 border-t-1 border-solid py-4 px-6 text-base',
          idx === 0 && "border-l-1",
          idx === columns.length - 1 && "border-r-[1px]",
          compareIndex(rowIdx) && 'border-[#73E8F2]',
        ])
      }}
      columns={columns}
      dataList={questInfo?.price_in_tokens || []}
    ></PayTable>
  )

  const renderTips = (type: ShopItemType | undefined) => {
    if (!type) return null;

    switch (type) {
      case ShopItemType.BENEFITS_WEEKLY:
        return <ProductCard>
          Open must have a random avatar * 1, the generated random avatar consists of 3 random colors, accessories, and backgrounds.
        </ProductCard>
      case ShopItemType.RESOURCES_DIAMOND:
        return (
          <ProductCard>
            Open must have a random avatar * 1, the generated random avatar consists of 3 random colors, accessories, and backgrounds.
          </ProductCard>
        )
      default:
        break;
    }
  }

  return (
    <>
      <Modal
        hideCloseButton
        isDismissable={false}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        style={{
          overflow: "initial"
        }}
        classNames={{
          base: "rounded-none bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/shop/bg_modal.png')] bg-no-repeat bg-contain !max-w-[57.25rem] !w-[57.25rem] aspect-[57.25/30]"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex justify-between relative" >
                <div>Buy</div>
                <S3Image onClick={onClose} src="/astrark/shop/btn_close.png" className="absolute top-[-1.3rem] right-[-1.625rem] w-[6.9375rem] h-[4.75rem] object-contain"></S3Image>
              </ModalHeader>
              <ModalBody className="flex flex-row">
                <div>
                  <ShopItem {...shopItemProps}></ShopItem>
                  {renderTips(shopItemProps.item?.type)}
                </div>
                <div className="flex-1">
                  {renderTable()}
                  <div className="mt-4 flex justify-center">
                    <PayButton
                      className="mr-4"
                      btnStatus={calcDisabled() ? "disabled" : undefined}
                      isLoading={loading}
                      onClick={toBuy}
                    >
                      Buy now
                    </PayButton>
                    <div className="flex items-center justify-center mt-[.7rem] px-[.625rem] h-[2.2rem] bg-[rgba(0,0,0,.3)]">
                      <S3Image src="/astrark/shop/icons/icon_timeout.png" className="w-[1.125rem] h-[1.125rem] mr-2"></S3Image>
                      <div className="text-[.875rem] w-[12.125rem]">Price will update in {cdText}</div>
                    </div>
                  </div>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal >

      <WalletModal key={[getCurSelectedKey()?.token_id, permit ?? Math.random()].join('_')} disclosure={walletDisclosure} itemInfo={getCurSelectedKey()} permit={permit}></WalletModal>
    </>
  );
}

export default PayModal;
