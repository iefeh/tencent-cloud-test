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
}
