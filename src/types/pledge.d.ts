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
    totalStaked: number,
    /** 每个区块的奖励 */
    rewardPerBlock: number,
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
    totalStaked: number,
    /** 用户已提取的数量 */
    totalWithdrawn: number,
    /** 用户已获得的奖励 */
    totalRewards: number,
    /** 当前质押中数量(包含锁仓中+未锁仓中) */
    currentStaked: number,
    /** 用户的质押记录列表 */
    stakes: UserStake[],
  ];

  type UserStake = [
    /** 质押金额 */
    amount: number,
    /** 锁仓结束时间，秒级时间戳 */
    lockEnd: number,
    /** 锁仓因子（放大100倍） */
    lockFactor: number,
    /** 奖励债务 */
    rewardDebt: number,
    /** 质押时间戳 */
    timestamp: number,
    /** 这次质押已收获的奖励数值 */
    reward: number,
    /** 提款时间(全部提取完毕才会设置) */
    withdrawTime: number,
    /** 已提取的金额 */
    withdrawAmount: number,
  ];
}
