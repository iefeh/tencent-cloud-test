import { BadgeItem } from '@/http/services/badges';
import type { TaskItem } from './quest';

declare namespace MiniGames {
  interface GameItem {
    client_id: string;
    url: string;
    img_url: string;
    ticket: {
      remain: number;
    };
    start_time: number;
    end_time: number;
    status: string;
    client_name: string;
    icon_url: string;
  }

  interface BannerMedia {
    url: string;
    thumb?: string;
  }

  interface GameDetailDTO {
    client_id: string;
    client_name: string;
    share: string;
    keywords: string[];
    ticket_expired_at: number | null;
    description: string;
    banner: BannerMedia[];
    platform: { url?: string; platform: string; icon: string }[];
    task_category: string;
    ranking: {
      game: string;
      leaderboard: {
        rank: number;
        player: string;
        score: number;
      }[];
      user_rank: string;
    };
    social: {
      type: string;
      description: string;
      url: string;
    }[];
    url: string;
    img_url: string;
    ticket: {
      remain: number;
    };
    status: string;
    tasks: TaskItem[];
    badge: BadgeItem[];
  }
}
