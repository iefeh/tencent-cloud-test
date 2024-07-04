export const enum PoolType {
  USDT = 'usdt',
  USDC = 'usdc',
  ETH = 'eth',
}

export const PoolProps = {
  [PoolType.USDT]: {
    id: -1,
    icon: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/pledge/icons/icon_usdt.png',
    token: 'USDT',
  },
  [PoolType.USDC]: {
    id: 1,
    icon: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/pledge/icons/icon_usdc.png',
    token: 'USDC',
  },
  [PoolType.ETH]: {
    id: 0,
    icon: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/pledge/icons/icon_eth.png',
    token: 'ETH',
  },
};

export const StakeFactors = [100, 114, 130, 149, 171, 195, 223, 255, 292, 334, 382, 437, 500];
