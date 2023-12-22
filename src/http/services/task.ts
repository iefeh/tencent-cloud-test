import http from '../index';

export interface TaskProperties {
  guild_id: string;
  role_ids: string[];
  guild_url: string;
}

export interface TaskReward {
  type: string;
  amount: number;
  max_amount: number;
}

export interface TaskListItem {
  id: string;
  description: string;
  name: string;
  properties: TaskProperties | null;
  reward: TaskReward;
  tip: string;
  type: string;
  authorization: string | null;
  user_authorized?: boolean;
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
