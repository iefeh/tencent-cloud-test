import { AcceleratorType, EVENT_REWARD_TYPE, EventStatus, QuestType } from '@/constant/task';
import http from '../index';
import { MyTokensRecord } from './token';

export interface TaskProperties {
  url?: string;
  is_prepared?: boolean;
  last_verified_time?: number;
  can_reverify_after?: number;
}

export interface TaskReward {
  type: string;
  amount: number;
  max_amount: number;
  min_amount: number;
  amount_formatted: string;
  token_reward?: {
    chain_id: string;
    token_address: string;
    token_claim_status?: string;
    whitelist_id: string[];
    estimated_raffle_time: number | null;
    actual_raffle_time: number | null;
  };
}

export interface TaskListItem {
  id: string;
  description: string;
  name: string;
  properties: TaskProperties;
  reward: TaskReward;
  tip: string;
  type: QuestType;
  authorization: string | null;
  user_authorized?: boolean;
  verified?: boolean;
  verify_disabled?: boolean;
  achieved?: boolean;
  started?: boolean;
  start_time?: number;
  started_after?: number;
  is_new?: boolean;
  current_progress?: number;
  target_progress?: number;
  user_token_reward?: MyTokensRecord;
}

export interface TaskListResDto {
  total: number;
  page_num: string;
  page_size: string;
  quests: TaskListItem[];
}

export function queryTaskListAPI(params: PageQueryDto): Promise<TaskListResDto> {
  return http.get('/api/quests/list', { params });
}

interface VerifyTaskResDTO {
  verified: boolean;
  claimed_amount?: number;
  require_authorization?: string;
  tip?: string;
}

export function verifyTaskAPI(data: { quest_id: string }): Promise<VerifyTaskResDTO> {
  return http.post('/api/quests/verify', JSON.stringify(data));
}

export function reverifyTaskAPI(data: { quest_id: string }): Promise<VerifyTaskResDTO> {
  return http.post('/api/quests/reverify', JSON.stringify(data));
}

export function prepareTaskAPI(data: { quest_id: string }): Promise<void> {
  return http.post('/api/quests/prepare', JSON.stringify(data));
}

export interface LeaderBoardItem {
  user_id: string;
  username: string;
  avatar_url: string;
  rank: number;
  moon_beam: number;
  is_top50?: boolean;
}

interface LeaderBoardRank {
  leaderboard: LeaderBoardItem[];
  me: LeaderBoardItem;
}

export function leaderBoardRankAPI(): Promise<LeaderBoardRank> {
  return http.get('/api/quests/leaderboard');
}

export interface TaskAdItem {
  image_url: string;
  link_url: string;
  title: string;
  description: string;
}

export function taskAdListAPI(): Promise<TaskAdItem[]> {
  return http.get('/api/quests/advertisements');
}

export function taskDetailsAPI(params: { quest_id: string }): Promise<{ quest: TaskListItem }> {
  return http.get('/api/quests/profile', { params });
}

export function queryInviteCodeAPI(): Promise<{ invite_code: string }> {
  return http.get('/api/users/invite');
}

export interface EventReward {
  type: EVENT_REWARD_TYPE;
  name: string;
  image_small: string;
  image_medium: string;
  amount: number;
  badge_id: string;
}

export interface EventItem {
  id: string;
  name: string;
  image_url: string;
  start_time: number;
  end_time: number;
  status: EventStatus;
  claimed: boolean;
  rewards: EventReward[];
}

export interface EventRewardAcceleratorProperty {
  reward_bonus: number;
  support_stacking: boolean;
  min_hold_duration: number;
  nft_market_url: string;
  reward_bonus_moon_beam: number;
  third_party_nft: boolean;
}

export interface EventRewardAccelerator {
  id: string;
  type: AcceleratorType;
  name: string;
  description: string;
  image_url: string;
  properties: EventRewardAcceleratorProperty;
}

export interface FullEventItem extends EventItem {
  description: string;
  claimable: boolean;
  tasks: TaskListItem[];
  claim_settings: {
    require_authorization: string;
    success_message: string;
    reward_accelerators: EventRewardAccelerator[];
    total_reward_bonus: number;
    total_reward_bonus_moon_beam: number;
  };
}

export interface EventPageQueryDTO extends PageQueryDto {
  campaign_status?: EventStatus;
}

export function queryEventListAPI(params: EventPageQueryDTO): Promise<PageResDTO<EventItem>> {
  return http.get('/api/campaigns/list', { params });
}

export function queryEventDetailsAPI(id: string): Promise<{ campaign: FullEventItem }> {
  return http.get('/api/campaigns/detail', { params: { campaign_id: id } });
}

export interface ParticipantsItem {
  avatar_url: string;
  user_id: string;
  username: string;
}

export function queryEventParticipantsAPI(
  params: PageQueryDto & { campaign_id: string },
): Promise<PageResDTO<ParticipantsItem>> {
  return http.get('/api/campaigns/participants', { params });
}

export interface ClaimEventRewardResDTO {
  claimed: boolean;
  tip: string;
}

export function claimEventRewardAPI(id: string): Promise<ClaimEventRewardResDTO | null> {
  return http.post('/api/campaigns/claim', JSON.stringify({ campaign_id: id }));
}

interface EventReqDTO {
  campaign_id: string;
  task_id: string;
}

export function verifyEventAPI(data: EventReqDTO): Promise<VerifyTaskResDTO> {
  return http.post('/api/campaigns/tasks/verify', JSON.stringify(data));
}

export function prepareEventAPI(data: EventReqDTO): Promise<void> {
  return http.post('/api/campaigns/tasks/prepare', JSON.stringify(data));
}
