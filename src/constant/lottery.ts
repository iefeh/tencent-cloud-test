export const LotteryMilestone = [30, 60, 80, 100, 120, 140, 155, 170, 185, 200];

export const BadgeIcons = [
  {
    icon: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/badges/lucky_draw_master/1.png',
    width: 48,
    left: 70,
    bottom: 30,
  },
  {
    icon: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/badges/lucky_draw_master/2.png',
    width: 57,
    left: 174,
    bottom: 41,
  },
  {
    icon: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/badges/lucky_draw_master/3.png',
    width: 59,
    left: 281,
    bottom: 50,
  },
  {
    icon: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/badges/lucky_draw_master/4.png',
    width: 62,
    left: 386,
    bottom: 57,
  },
  {
    icon: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/badges/lucky_draw_master/5.png',
    width: 59,
    left: 491,
    bottom: 66,
  },
  {
    icon: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/badges/lucky_draw_master/6.png',
    width: 63,
    left: 594,
    bottom: 73,
  },
  {
    icon: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/badges/lucky_draw_master/7.png',
    width: 65,
    left: 700,
    bottom: 82,
  },
  {
    icon: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/badges/lucky_draw_master/8.png',
    width: 74,
    left: 805,
    bottom: 90,
  },
  {
    icon: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/badges/lucky_draw_master/9.png',
    width: 138,
    left: 912,
    bottom: 102,
  },
  {
    icon: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/badges/lucky_draw_master/10.png',
    width: 158,
    left: 1017,
    bottom: 112,
  },
];

export const enum LotteryRewardType {
  TICKET = 'lottery_ticket',
}

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
  },
  [RewardQuality.SILVER]: {
    img: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/border/silver.png',
    width: 154,
    height: 154,
  },
  [RewardQuality.BLUE]: {
    img: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/border/blue.png',
    width: 154,
    height: 154,
  },
  [RewardQuality.PURPLE]: {
    img: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/border/purple.png',
    width: 205,
    height: 194,
  },
  [RewardQuality.GOLDEN]: {
    img: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/border/golden.png',
    width: 228,
    height: 214,
  },
};

export const MBsPerDraw = 25;
