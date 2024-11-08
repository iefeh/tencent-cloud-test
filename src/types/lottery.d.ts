import type { BattlePassRewardDTO } from '@/http/services/battlepass';
import type { BadgeSerie } from './../http/services/badges';
import type { LotteryRequirementType, LotteryRewardType, LotteryStatus, RewardQuality } from '@/constant/lottery';
import type { LotteryRequirementDTO } from '@/http/services/lottery';

declare namespace Lottery {
  interface Pool<T = RewardItem> {
    lottery_pool_id: string;
    start_time: number;
    end_time: number;
    draw_limits: number;
    rest_draw_amount: number;
    total_draw_amount: number;
    user_s1_lottery_ticket_amount: number;
    user_free_lottery_ticket_amount: number;
    user_mb_amount: number;
    can_claim_premium_benifits: boolean;
    first_twitter_topic_verified?: boolean;
    rewards: RewardItem[] | LimitedReward[];
    need_verify_twitter?: boolean;
    title: string;
    name?: string;
    icon_url?: string;
    icon_frame_level?: number;
    open_status?: LotteryStatus;
    user_meet_requirement?: boolean;
    user_meet_requirement_type?: LotteryRequirementType;
    requirement_description?: string;
    requirements: LotteryRequirementDTO[];
  }

  interface LimitedReward {
    reward_name: string;
    reward_level: number;
    icon_url: string;
    reward_type: LotteryRewardType;
  }

  interface RewardItem {
    item_id?: string;
    icon_url: string;
    reward_type: LotteryRewardType;
    reward_name: string;
    reward_level: RewardQuality;
    reward_claim_type: number;
    amount: number;
    claimed: boolean;
    cdk?: string;
  }

  interface RewardDTO {
    rewards: RewardItem[];
  }

  interface ClaimReqDTO {
    draw_id: string;
    lottery_pool_id: string;
    reward_id?: string;
  }

  interface DrawDTO {
    draw_id: string;
    lottery_pool_id: string;
    draw_count: number;
    lottery_ticket_cost: number;
    mb_cost: number;
  }

  interface RewardResDTO {
    draw_time?: number;
    available_draw_time?: number;
    draw_id: string;
    lottery_pool_id: string;
    rewards: RewardItem[];
    success?: boolean;
    message?: string;
  }

  interface DrawHistoryDTO {
    draw_id: string;
    draw_time: number;
    lottery_pool_id: string;
    rewards: RewardItem[];
    user_id: string;
  }

  interface MilestoneDTO {
    total_draw_amount: number;
    luckyDrawBadge: {
      badge_id: string;
      name: string;
      max_level_obtained: number;
      obtain_url: string;
      series: (BadgeSerie & { requirements: number })[];
    };
  }
}

interface HomeSlide {
  hasVideo?: boolean;
}
