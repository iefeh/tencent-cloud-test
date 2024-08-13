import { signInParticleAPI } from '@/http/services/login';
import { useUserContext } from '@/store/User';
import { type UserInfo } from '@particle-network/auth-core';
import { useConnect, useUserInfo } from '@particle-network/auth-core-modal';
import { useEffect } from 'react';

/** 仅用于接入particle和自动登出，全局应用一次即可 */
export default function useParticle() {
  const { connect, connected, disconnect } = useConnect();
  const { userInfo } = useUserInfo();
  const { jwtToken } = useUserContext();

  async function loginParticle() {
    let particleUserInfo: UserInfo | undefined;
    try {
      particleUserInfo = await connect({ provider: 'jwt', thirdpartyCode: jwtToken } as any);
      console.log('particle user info: ', particleUserInfo);
    } catch (error) {
      console.error('loginParticle error:', error);
      return;
    }
    if (!particleUserInfo) return;

    const { token, uuid } = particleUserInfo!;
    console.log('particle has logged in, token: ', token);
    console.log('particle has logged in, uuid: ', uuid);

    const data: ParticleAuthDto = {
      particle_auth_token: token,
      particle_user_id: uuid,
      platform: 'web',
    };

    console.log('particle report request, token: ', token);
    const res = await signInParticleAPI(data);
    return res;
  }

  useEffect(() => {
    if (jwtToken && !connected) {
      loginParticle();
    } else if (!jwtToken && connected) {
      disconnect();
    }
  }, [jwtToken, connected]);

  return { userInfo, connect, loginParticle };
}
