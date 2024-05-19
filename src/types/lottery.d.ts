import { LotteryRewardType, RewardQuality } from '@/constant/lottery';

declare namespace Lottery {
  interface Pool {
    lottery_pool_id: string;
    start_time: number;
    end_time: number;
    draw_limits: number;
    rest_draw_amount: number;
    total_draw_amount: number;
    user_s1_lottery_ticket_amount: number;
    user_free_lottery_ticket_amount: number;
    user_mb_amount: number;
    rewards: RewardItem[];
  }

  interface RewardItem {
    icon_url: string;
    reward_type: LotteryRewardType;
    reward_name: string;
    reward_level: RewardQuality;
    reward_claim_type: number;
    amount: number;
  }

  interface RewardDTO {
    rewards: RewardItem[];
  }

  interface DrawDTO {
    lottery_pool_id: string;
    draw_count: number;
    lottery_ticket_cost: number;
    mb_cost: number;
  }
}
