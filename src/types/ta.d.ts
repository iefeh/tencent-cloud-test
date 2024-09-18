import type { MediaType } from '@/constant/task';

declare namespace EventTracking {
  interface LoginTrackDTO {
    is_new_user: boolean;
    login_type: MediaType;
    wallet_type: string;
  }
}
