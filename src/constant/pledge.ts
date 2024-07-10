export const enum PoolType {
  USDT = 'usdt',
  USDC = 'usdc',
  ETH = 'eth',
}

export const PoolProps = {
  [PoolType.USDT]: {
    id: 2,
    icon: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/pledge/icons/icon_usdt.png',
    token: 'USDT',
    contract: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
  },
  [PoolType.USDC]: {
    id: 1,
    icon: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/pledge/icons/icon_usdc.png',
    token: 'USDC',
    contract: '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8',
  },
  [PoolType.ETH]: {
    id: 0,
    icon: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/pledge/icons/icon_eth.png',
    token: 'ETH',
    contract: '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8',
  },
};

export const StakeFactors = [100, 114, 130, 149, 171, 195, 223, 255, 292, 334, 382, 437, 500];
