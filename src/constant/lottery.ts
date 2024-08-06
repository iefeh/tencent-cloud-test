export const BadgeIcons = [
  {
    width: 48,
    left: 70,
    bottom: 30,
  },
  {
    width: 57,
    left: 174,
    bottom: 41,
  },
  {
    width: 59,
    left: 281,
    bottom: 50,
  },
  {
    width: 62,
    left: 386,
    bottom: 57,
  },
  {
    width: 59,
    left: 491,
    bottom: 66,
  },
  {
    width: 63,
    left: 594,
    bottom: 73,
  },
  {
    width: 65,
    left: 700,
    bottom: 82,
  },
  {
    width: 74,
    left: 805,
    bottom: 90,
  },
  {
    width: 138,
    left: 912,
    bottom: 102,
  },
  {
    width: 158,
    left: 1017,
    bottom: 112,
  },
];

export const enum LotteryRewardType {
  MoonBeam = 'moon_beam',
  LotteryTicket = 'lottery_ticket',
  USDT = 'usdt',
  NFT = 'nft',
  NoPrize = 'no_prize',
  GIFT_CARD = 'gift_card',
}

export const LotteryRewardSizes = {
  [LotteryRewardType.MoonBeam]: '50%',
  [LotteryRewardType.LotteryTicket]: '80%',
  [LotteryRewardType.USDT]: '80%',
  [LotteryRewardType.NFT]: '70%',
  [LotteryRewardType.NoPrize]: '90%',
};

export const enum RewardQuality {
  COPPERY = 1,
  SILVER,
  BLUE,
  PURPLE,
  GOLDEN,
}

export const LotteryBorders = {
  [RewardQuality.COPPERY]: {
    img: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/border/coppery.png',
    width: 154,
    height: 154,
    color: '#64523E',
  },
  [RewardQuality.SILVER]: {
    img: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/border/silver.png',
    width: 154,
    height: 154,
    color: '#C2C2C2',
  },
  [RewardQuality.BLUE]: {
    img: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/border/blue.png',
    width: 154,
    height: 154,
    color: '#7DC8C6',
  },
  [RewardQuality.PURPLE]: {
    img: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/border/purple.png',
    width: 200,
    height: 189,
    color: '#835CBF',
  },
  [RewardQuality.GOLDEN]: {
    img: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/border/golden.png',
    width: 222,
    height: 208,
    color: 'linear-gradient(to right, #D9A970, #EFEBC5)',
  },
};

export const MBsPerDraw = 25;
