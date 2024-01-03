import { QuestType } from '@/constant/task';
import http from '../index';

export interface TaskProperties {
  url?: string;
  last_verified_time?: number;
  can_reverify_after?: number;
}

export interface TaskReward {
  type: string;
  amount: number;
  max_amount: number;
  min_amount: number;
}

export interface TaskListItem {
  id: string;
  description: string;
  name: string;
  properties: TaskProperties | null;
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

export interface LeaderBoardItem {
  user_id: string;
  username: string;
  avatar_url: string;
  rank: number;
  moon_beam: number;
}

interface LeaderBoardRank {
  leaderboard: LeaderBoardItem[];
  me: LeaderBoardItem;
}

export function leaderBoardRankAPI(): Promise<LeaderBoardRank> {
  return http.get('/api/quests/leaderboard');
}
