import http from '../index';

export interface BadgeItem {
  id: string;
  label: string;
  description?: string;
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
    description: '在Moonneil 累积签到20天可获得 2023-11-09  Obtained this badge',
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
  {
    id: '12',
    label: 'NFT Briger',
    imgUrl: 'https://yiyun-yijian.oss-cn-chengdu.aliyuncs.com/moonveil/badges/NFT%20BRIGER10.png',
    isSeries: true,
    serieNo: 11,
    achieved: true,
    mintable: true,
    // minted: true,
  },
];

let DISPLAY_LIST: (string | null)[] = Array(5).fill(null);

export function queryBadgesPageListAPI(params: PageQueryDto): Promise<PageResDTO<BadgeItem>> {
  const data: BadgeItem[] = JSON.parse(JSON.stringify(BADGES_DATA));
  data.forEach((item) => {
    item.isDisplayed = DISPLAY_LIST.includes(item.id);
  });

  const res: PageResDTO<BadgeItem> = {
    total: BADGES_DATA.length * 3,
    page_num: params.page_num + '',
    page_size: params.page_size + '',
    data,
  } as any;

  return Promise.resolve(res);
}

export function queryDisplayBadgesAPI(): Promise<BadgeItem[]> {
  const items = DISPLAY_LIST.map((id) => id && BADGES_DATA.find((item) => item.id === id));
  const res: BadgeItem[] = JSON.parse(JSON.stringify(items));
  res.forEach((item) => {
    if (item) item.isDisplayed = true;
  });

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

export function toggleBadgeDisplayAPI(id: string, index?: number): Promise<boolean> {
  const existedIndex = DISPLAY_LIST.indexOf(id);
  if (existedIndex > -1) {
    if (index !== undefined) {
      DISPLAY_LIST.splice(existedIndex, 1, null);
      DISPLAY_LIST[index] = id;
    } else {
      DISPLAY_LIST.splice(existedIndex, 1);
    }
  } else {
    if (index !== undefined) {
      DISPLAY_LIST[index] = id;
    } else {
      const firstEmptyIndex = DISPLAY_LIST.indexOf(null);

      if (firstEmptyIndex < 0) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(false);
          }, 500);
        });
      }

      DISPLAY_LIST[firstEmptyIndex] = id;
    }
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 500);
  });
}

export function sortDisplayBadgesAPI(data: { newIndex: number; oldIndex: number }): Promise<boolean> {
  const { oldIndex, newIndex } = data;
  let lastId = DISPLAY_LIST[oldIndex];
  DISPLAY_LIST[oldIndex] = DISPLAY_LIST[newIndex];
  DISPLAY_LIST[newIndex] = lastId;

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 500);
  });
}
