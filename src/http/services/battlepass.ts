import http from '../index';

export interface BattlePassBadgeRewardDTO {
  type: 'badge';
  properties: {
    badge_id: string;
    description: string;
    icon_url: string;
    image_url: string;
  };
}

export interface BattlePassMBRewardDTO {
  type: 'moon_beam';
  properties: {
    reward_moon_beam: number;
  };
}

export type BattlePassRewardDTO = BattlePassBadgeRewardDTO | BattlePassMBRewardDTO;

export interface BattlePassLevelDTO {
  lv: string;
  reward_type: string;
  rewards: BattlePassRewardDTO[];
  task_line: number;
  satisfied_time?: number | null;
  claimed_time?: number | null;
}

export interface BattleInfoDTO {
  /** 用户是否已开始当前赛季 */
  started: boolean;
  /** 用户是否已拥有赛季通行证 */
  has_battle_pass: boolean;
  /** 是否为高阶用户 */
  is_premium: boolean;
  /** 用户当前等级 */
  max_lv: number;
  /** 开始时间 */
  start_time: number;
  /** 结束时间 */
  end_time: number;
  standard_pass?: BattlePassLevelDTO[];
  premium_pass?: BattlePassLevelDTO[];
  all_requirements?: {
    badge: string[];
    nft: string[];
  };
}

export function queryBattleInfoAPI(): Promise<BattleInfoDTO> {
  return http.get('/api/battlepass/overview');
}

export function claimBattleRewardAPI(data: { reward_type: string; lv: number }): Promise<{ result: string }> {
  return http.post('/api/battlepass/claim', JSON.stringify(data));
}

export function createBattlePassAPI() {
  return http.get('/api/battlepass/participate');
}
