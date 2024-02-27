import http from '../index';

export interface BadgeItem {
  id: string;
  label: string;
  imgUrl: string;
  achieved?: boolean;
  claimed?: boolean;
  isDisplayed?: boolean;
  isSeries?: boolean;
  serie?: string;
  serieNo?: number;
  mintable?: boolean;
  minted?: boolean;
}

const BADGES_DATA: BadgeItem[] = [
  {
    id: '1',
    label: '初出茅庐',
    imgUrl: 'https://yiyun-yijian.oss-cn-chengdu.aliyuncs.com/moonveil/badges/%E5%88%9D%E5%87%BA%E8%8C%85%E5%BA%90.png',
    achieved: false,
  },
  {
    id: '2',
    label: 'NFT Briger',
    imgUrl: 'https://yiyun-yijian.oss-cn-chengdu.aliyuncs.com/moonveil/badges/NFT%20BRIGER1.png',
    isSeries: true,
    serieNo: 1,
    achieved: true,
  },
  {
    id: '3',
    label: 'NFT Briger',
    imgUrl: 'https://yiyun-yijian.oss-cn-chengdu.aliyuncs.com/moonveil/badges/NFT%20BRIGER2.png',
    isSeries: true,
    serieNo: 2,
    achieved: true,
  },
  {
    id: '4',
    label: 'NFT Briger',
    imgUrl: 'https://yiyun-yijian.oss-cn-chengdu.aliyuncs.com/moonveil/badges/NFT%20BRIGER3.png',
    isSeries: true,
    serieNo: 3,
    achieved: true,
  },
  {
    id: '5',
    label: 'NFT Briger',
    imgUrl: 'https://yiyun-yijian.oss-cn-chengdu.aliyuncs.com/moonveil/badges/NFT%20BRIGER4.png',
    isSeries: true,
    serieNo: 4,
    achieved: true,
  },
  {
    id: '6',
    label: 'NFT Briger',
    imgUrl: 'https://yiyun-yijian.oss-cn-chengdu.aliyuncs.com/moonveil/badges/NFT%20BRIGER5.png',
    isSeries: true,
    serieNo: 5,
    achieved: true,
  },
  {
    id: '7',
    label: 'NFT Briger',
    imgUrl: 'https://yiyun-yijian.oss-cn-chengdu.aliyuncs.com/moonveil/badges/NFT%20BRIGER6.png',
    isSeries: true,
    serieNo: 6,
    achieved: true,
  },
  {
    id: '8',
    label: 'NFT Briger',
    imgUrl: 'https://yiyun-yijian.oss-cn-chengdu.aliyuncs.com/moonveil/badges/NFT%20BRIGER7.png',
    isSeries: true,
    serieNo: 7,
    achieved: true,
  },
  {
    id: '9',
    label: 'NFT Briger',
    imgUrl: 'https://yiyun-yijian.oss-cn-chengdu.aliyuncs.com/moonveil/badges/NFT%20BRIGER8.png',
    isSeries: true,
    serieNo: 8,
    achieved: true,
  },
  {
    id: '10',
    label: 'NFT Briger',
    imgUrl: 'https://yiyun-yijian.oss-cn-chengdu.aliyuncs.com/moonveil/badges/NFT%20BRIGER9.png',
    isSeries: true,
    serieNo: 9,
    achieved: true,
  },
  {
    id: '11',
    label: 'NFT Briger',
    imgUrl: 'https://yiyun-yijian.oss-cn-chengdu.aliyuncs.com/moonveil/badges/NFT%20BRIGER10.png',
    isSeries: true,
    serieNo: 10,
    achieved: true,
    mintable: true,
    // minted: true,
  },
];

export function queryBadgesPageListAPI(params: PageQueryDto): Promise<PageResDTO<BadgeItem>> {
  const res: PageResDTO<BadgeItem> = {
    total: BADGES_DATA.length * 3,
    page_num: params.page_num + '',
    page_size: params.page_size + '',
    data: JSON.parse(JSON.stringify(BADGES_DATA)),
  } as any;

  return Promise.resolve(res);
}

export function queryDisplayBadgesAPI(): Promise<BadgeItem[]> {
  const res = JSON.parse(JSON.stringify(BADGES_DATA.filter((item) => item.isDisplayed)));

  return Promise.resolve(res);
}

export function claimBadgeAPI(id: string): Promise<boolean> {
  const item = BADGES_DATA.find((badge) => badge.id === id);
  if (item) item.claimed = true;

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 500);
  });
}

export function mintBadgeAPI(id: string): Promise<boolean> {
  const item = BADGES_DATA.find((badge) => badge.id === id);
  if (item && item.mintable) {
    item.minted = true;
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 500);
  });
}
