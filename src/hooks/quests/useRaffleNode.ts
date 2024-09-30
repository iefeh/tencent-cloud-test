import { TaskListItem } from '@/http/services/task';

export default function useRaffleNode(task: TaskListItem) {
  const { reward: { raffle_node: nodeReward } = {}, participant_end_time, user_node_reward, end_time } = task;
  const { win_reward } = user_node_reward || {};
  const isRaffleNode = !!nodeReward;
  const { estimated_raffle_time, actual_raffle_time } = nodeReward || {};
  const status = 0;
  const endTime = 0;

  function calcStatus() {
    const now = Date.now();

    if (now >= endTime) return 3;
    if (!!user_node_reward || (actual_raffle_time && now >= actual_raffle_time)) return 2;
    if (estimated_raffle_time && now >= estimated_raffle_time) return 1;

    return 0;
  }

  function calcEndTime(state: number) {
    if (state >= 2) return end_time;
    if (state >= 1) actual_raffle_time;
    if (state >= 0) estimated_raffle_time || participant_end_time;
  }

  return { raffleStatus: status, raffleEndTime: endTime, isRaffleNode, hasClaimedNode: !!win_reward };
}
