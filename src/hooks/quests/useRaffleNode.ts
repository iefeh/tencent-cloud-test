import { TaskListItem } from '@/http/services/task';

export default function useRaffleNode(task: TaskListItem) {
  const {
    reward: { raffle_node: nodeReward, distribute_node, verify_end_time, node_multiplier } = {},
    user_node_reward,
    end_time = 0,
  } = task;
  let nodeIconUrl = '';
  let nodeText = '';
  if (node_multiplier) {
    nodeIconUrl = task.reward.icon_url || '';
    nodeText = task.reward.node_name || '';
  } else {
    const { icon_url, node_name, node_amount } = nodeReward || distribute_node || {};
    nodeIconUrl = icon_url || '';
    nodeText = node_amount + ' ' + (node_name || '');
  }

  const { win_reward } = user_node_reward || {};
  const isRaffleNode = !!nodeReward;
  const { estimated_raffle_time, actual_raffle_time } = nodeReward || {};
  const status = calcStatus();
  const endTime = calcEndTime(status);

  function calcStatus() {
    const now = Date.now();
    if (now >= end_time) return 3;
    if (!!user_node_reward || (actual_raffle_time && now >= actual_raffle_time)) return 2;
    if (estimated_raffle_time && now >= estimated_raffle_time) return 1;

    return 0;
  }

  function calcEndTime(state: number) {
    if (state >= 2) return end_time || 0;
    if (state >= 1) return actual_raffle_time || 0;
    return estimated_raffle_time || verify_end_time || 0;
  }

  return {
    raffleStatus: status,
    raffleEndTime: endTime,
    isRaffleNode,
    hasWinReward: !!win_reward,
    isRaffleState: status >= 2,
    nodeIconUrl,
    nodeText,
  };
}
