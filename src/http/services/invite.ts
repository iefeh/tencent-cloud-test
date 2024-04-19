import http from '../index';

export interface InviteReferral {
  id: string;
  name: string;
  alias: string;
  obtain_url: string;
  description: string;
  series: DiplomatSerie[];
}

export interface DiplomatSerie {
  description: string;
  icon_url: string;
  image_url: string;
  reward_moon_beam: number;
  level: number;
  obtained: boolean;
  claimed: boolean;
  milestone?: number;
}

interface InviteDiplomat {
  id: string;
  name: string;
  obtain_url: string;
  series: DiplomatSerie[];
}

export interface InviteMilestone {
  direct_invitee: number;
  successful_direct_invitee: number;
  indirect_invitee: number;
  successful_indirect_invitee: number;
  total_claimed_badge_reward: number;
  diplomat: InviteDiplomat;
  referrals: InviteReferral[];
  successful_direct_invitee_reward: number;
  successful_indirect_invitee_reward: number;
  total_reward: number;
}

export function queryInviteMilestoneAPI(): Promise<InviteMilestone> {
  return http.get('/api/users/invitation/milestone');
}
