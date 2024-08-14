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
    name: string;
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
        avatar: string;
      }[];
      user_rank: string;
    };
    social: {
      type: string;
      description: string;
      url: string;
    }[];
    url: string;
    poster: {
      img_url: string;
      bg_img_url: string;
    };
    ticket: {
      remain: number;
    };
    status: string;
    tasks: TaskItem[];
    badge: BadgeItem[];
    ticket_price_formatted: string;
    ticket_price_raw: string;
    token_address: string;
    url: string;
    share_reward_claimed: boolean;
  }

  interface BuyTicketPermit {
    game: string;
    expiration: number;
    player: string;
    signature: string;
    tickets: string;
    token: string;
    tokenAmount: string;
  }

  interface BuyTicketPermitDTO {
    /** 交互的目标链id */
    chain_id: string;
    /** 交互的目标合约地址 */
    contract_address: string;
    /** 交互参数，数组 */
    permit: Permit;
  }
}
