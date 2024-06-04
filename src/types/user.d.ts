interface GoogleUserInfo {
  _id: string;
  user_id: string;
  google_id: string;
  email: string;
  email_verified: boolean;
  given_name: string;
  family_name: string;
  name: string;
  locale: string;
  picture: string;
  created_time: number;
  deleted_time: number | null;
}

interface ParticleUserInfo {
  evm_wallet: string;
  user_id: string;
  web_token: string;
}

interface BaseMediaInfo {
  username: string;
  avatar_url: string;
}

interface UserInfo {
  user_id: string;
  username: string;
  avatar_url: string;
  email: string;
  created_time: number;
  google?: BaseMediaInfo;
  particle?: ParticleUserInfo;
  moon_beam: number;
  steam?: BaseMediaInfo;
  twitter?: BaseMediaInfo;
  discord?: BaseMediaInfo;
  wallet?: string;
  invite_code: string;
}
