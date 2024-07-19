namespace Pledge {
  interface LockedHistoryItem {
    id: string;
    date: string;
    time: string;
    description: string;
    dueDate: string;
  }

  type PoolInfo = [
    /** 质押的ERC20代币，如果为address(0)表示ETH */
    stakingToken: string,
    /** 代币精度，用于计算用户调用方法时的实际数量 */
    tokenDecimal: number,
    /** 该池中质押的总金额 */
    totalStaked: bigint,
    /** 每个区块的奖励 */
    rewardPerBlock: bigint,
    /** 每份质押的累积奖励 */
    accumulatedRewardPerShare: number,
    /** 上一次计算奖励的区块 */
    lastRewardBlock: number,
    /** 质押池是否被禁用 */
    disabled: boolean,
    /** 质押池是否被屏蔽，只能提取不能继续质押 */
    blocked: boolean,
  ];

  type UserStakeInfo = [
    /** 用户总共质押的数量 */
    totalStaked: bigint,
    /** 用户已提取的数量 */
    totalWithdrawn: bigint,
    /** 用户已获得的奖励 */
    totalRewards: bigint,
    /** 当前质押中数量(包含锁仓中+未锁仓中) */
    currentStaked: bigint,
    /** 用户的质押记录列表 */
    stakes: UserStake[],
  ];

  type UserStake = [
    /** 质押金额 */
    amount: bigint,
    /** 锁仓结束时间，秒级时间戳 */
    lockEnd: bigint,
    /** 锁仓因子（放大100倍） */
    lockFactor: bigint,
    /** 奖励债务 */
    rewardDebt: bigint,
    /** 质押时间戳 */
    timestamp: bigint,
    /** 这次质押已收获的奖励数值 */
    reward: bigint,
    /** 提款时间(全部提取完毕才会设置) */
    withdrawTime: bigint,
    /** 已提取的金额 */
    withdrawAmount: bigint,
  ];
}
