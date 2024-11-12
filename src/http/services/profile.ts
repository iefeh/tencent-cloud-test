import http from '../index';

export interface MBHistoryRecord {
  type: string;
  moon_beam_delta: number;
  created_time: number;
  quest_id: string;
  name: string;
}
export interface MBHistoryDetailsRecord {
  type: string;
  moon_beam_delta: number;
  created_time: number;
  quest_id: string;
  item: string;
}

export function queryMBHistoryListAPI(params: PageQueryDto): Promise<PageResDTO<MBHistoryRecord>> {
  return http.get('/api/users/moonbeams', { params });
}

export function queryMBHistoryDetailsListAPI(
  params: PageQueryDto & { tab?: string },
): Promise<PageResDTO<MBHistoryDetailsRecord> & { tabs: string[]; current_tab: string }> {
  return http.get('/api/users/moonbeam_list', { params });
}

interface UpdateUserInfoDto {
  avatar_url?: string;
  username?: string;
}

export function updateUserInfoAPI(data: UpdateUserInfoDto): Promise<boolean | null> {
  return http.post('/api/users/profile', JSON.stringify(data));
}

export function checkNoviceNotchAPI(data: { period?: number }): Promise<boolean | null> {
  return http.post('/api/users/kyc', JSON.stringify(data));
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
