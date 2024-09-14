import React, { FC, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, Button, Selection } from "@nextui-org/react";
import S3Image from "@/components/common/medias/S3Image";
import { cn } from "@nextui-org/react";
import PayTable from "@/components/common/CommonTable";
import ShopItem, { ClickProps } from "../CateTabs/ShopItem";
import styles from './index.module.scss'
import type { AstrArk } from '@/types/astrark';
import { ShopItemType } from "@/constant/astrark";
import ProductCard from "./ProductCard";
import useCountdown from '@/hooks/useCountdown';
import dayjs from 'dayjs';

export interface PayModalProps {
  disclosure: Disclosure;
  shopItemProps: ItemProps<AstrArk.ShopItem> & ClickProps;
}

const TokenUrlEnum = {
  More: '/astrark/shop/icons/icon_$more.png',
}

const NetUrlEnum = {
  polygon: '/astrark/shop/icons/icon_polygon.png',
  moonVeil: '/astrark/shop/icons/moonVeil.png'
}

const getUrl = (map: Dict<string>, key: string) => {
  return map?.[key] || ''
}

const columns = [
  {
    dataIndex: "name",
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
          <div className="text-[.8125rem] text-center w-[4.625rem] aspect-[74/26] absolute top-[-100%] right-8 bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/shop/bg_off.png')] bg-no-repeat bg-contain">{record.discount || '85% OFF'}</div>
        </div>
      )
    }
  },
  {
    dataIndex: 'qty',
    name: (
      <div>
        <div>QTY</div>
        <div className="text-xs text-[rgba(245,201,141,.3)]">(Token)</div>
      </div>
    )
  },
  {
    dataIndex: 'token',
    name: 'Token',
    render: (text: string, record: any) => {
      const url = getUrl(TokenUrlEnum, record.net)
      return (
        <div className="flex items-center">
          {url
            ? <S3Image className="w-[1.625rem] h-[1.625rem] rounded-full mr-2" src={url}></S3Image >
            : <div className="w-[1.625rem] h-[1.625rem] rounded-full bg-white mr-2"></div>
          }
          <div>{text}</div>
        </div>
      )
    }
  },
  {
    dataIndex: 'net',
    name: 'Network',
    render: (text: string, record: any) => {
      const url = getUrl(NetUrlEnum, text)
      return (
        <div className="flex items-center">
          {url
            ? <S3Image className="w-[1.625rem] h-[1.625rem] rounded-full mr-2" src={url}></S3Image >
            : <div className="w-[1.625rem] h-[1.625rem] rounded-full bg-white mr-2"></div>
          }
          <div>{text}</div>
        </div>
      )
    }
  },
]

const PayModal: FC<PayModalProps> = (props) => {
  const { shopItemProps, disclosure } = props;
  const { isOpen, onClose } = disclosure || {};
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set<string>(["0"]));
  const [cdText, setCdText] = useState<string>('00:00:00');
  const [loading, setLoading] = useState<boolean>(false)

  useCountdown(5 * 60 * 1000 || 0, 0, (leftTime) => {
    const du = dayjs.duration(leftTime);
    setCdText(du.format('HH:mm:ss'));

  });

  const [dataList, setDataList] = useState([
    { name: '$85', qty: 160, token: 'MOON', net: 'BSC' },
    { name: '$85', qty: 160, token: 'MOON', net: 'BSC' },
    { name: '$85', qty: 160, token: 'MOON', net: 'BSC' },
    { name: '$85', qty: 160, token: 'MOON', net: 'BSC' },
    { name: '$85', qty: 160, token: 'MOON', net: 'BSC' },
  ])

  const toBuy = () => {
    setLoading(true)
  }

  const compareIndex = (idx: number) => {
    const key = (selectedKeys as any)?.values()?.next()?.value
    return idx === Number(key)
  }

  const renderTable = () => (
    <PayTable
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
      dataList={dataList}
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
        {...disclosure}
        hideCloseButton
        isOpen={isOpen}
        onClose={onClose}
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
                    <Button
                      isLoading={loading}
                      className={cn([
                        "text-[#5D3C13] text-[1.1875rem] rounded-none bg-transparent",
                        "w-[10.1875rem] h-[3.625rem] bg-no-repeat bg-center bg-[length:100%_100%]",
                        "bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/shop/btn_buy_now.png')]",
                        "[text-shadow:0px_2px_0px_#FFE77F]"
                      ])}
                      onClick={toBuy}
                    >
                      Buy now
                    </Button>
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
    </>
  );
}

export default PayModal;
