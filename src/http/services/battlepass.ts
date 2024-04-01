import http from '../index';

export interface BattlePassDTO {
  reward_moon_beam: number;
  badge_id: string;
  icon_url: string;
  image_url: string;
  description: string;
  lv: string;
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
  standard_pass: BattlePassDTO[];
}

export function queryBattleInfoAPI(): Promise<BattleInfoDTO> {
  return http.get('/api/battlepass/overview');
}
