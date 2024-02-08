import { EventStatus, QuestType } from '@/constant/task';
import http from '../index';

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
  achieved?: boolean;
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
  type: string;
  name: string;
  image_small: string;
  image_medium: string;
  amount: number;
  badge_id: string;
}

export interface EventItem {
  name: string;
  image_url: string;
  start_time: number;
  end_time: number;
  status: EventStatus;
  claimed: boolean;
  rewards: EventReward[];
}

export interface EventPageQueryDTO extends PageQueryDto {
  campaign_status?: EventStatus;
}

export function queryEventListAPI(params: EventPageQueryDTO): Promise<PageResDTO<EventItem>> {
  return http.get('/api/campaigns/list', { params });
}
