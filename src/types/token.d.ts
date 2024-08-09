declare namespace TokenReward {
  interface Permit {
    claimer: string;
    expiration: number;
    reqId: string;
    signature: string;
    token: string;
    tokenAmount: string;
  }

  interface PermitDTO {
    /** 交互的目标链id */
    chain_id: string;
    /** 交互的目标合约地址 */
    contract_address: string;
    /** 交互参数，数组 */
    permits: Permit[];
  }
}
