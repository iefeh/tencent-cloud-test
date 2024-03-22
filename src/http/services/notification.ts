import http from '../index';

export interface NotificationItem {
  user_id: string;
  notification_id: string;
  content: string;
  link?: string;
  type: string;
  range: string;
  created_time: number;
  readed?: boolean;
}

export function queryNotificationPageListAPI(
  params: PageQueryDto,
): Promise<PageResDTO<NotificationItem> & { has_unread?: boolean }> {
  return http.get('/api/notification/list', { params });
}

export function readNotificationAPI(data: { notification_id?: string }): Promise<{ success: boolean }> {
  return http.post('/api/notification/read', JSON.stringify(data));
}
