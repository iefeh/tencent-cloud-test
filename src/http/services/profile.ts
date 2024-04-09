import http from '../index';

export interface MBHistoryRecord {
  type: string;
  moon_beam_delta: number;
  created_time: number;
  quest_id: string;
  name: string;
}

export interface MBHistoryListDto {
  total: number;
  page_num: string;
  page_size: string;
  quests: MBHistoryRecord[];
}

export function queryMBHistoryListAPI(params: PageQueryDto): Promise<MBHistoryListDto> {
  return http.get('/api/users/moonbeams', { params });
}

interface UpdateUserInfoDto {
  avatar_url?: string;
  username?: string;
}

export function updateUserInfoAPI(data: UpdateUserInfoDto): Promise<boolean | null> {
  return http.post('/api/users/profile', JSON.stringify(data));
}

export interface Invitee {
  avatar: string;
  nickname: string;
  details?: string;
  reward?: number;
  isSocialConnect?: boolean;
  completed?: boolean;
}

export function queryInviteesAPI(data: { isSocialConnect: boolean; completed: boolean }): Promise<Invitee[]> {
  let result: Invitee[] = [];
  if (data.completed) {
    result = [];
  } else {
    result = [];
  }

  return Promise.resolve(result);
}
