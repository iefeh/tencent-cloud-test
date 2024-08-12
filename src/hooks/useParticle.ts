import { signInParticleAPI } from '@/http/services/login';
import { useUserContext } from '@/store/User';
import { type UserInfo } from '@particle-network/auth-core';
import { useConnect, useUserInfo } from '@particle-network/auth-core-modal';
import { useEffect } from 'react';

export default function useParticle() {
  const { connect, connected, disconnect } = useConnect();
  const { userInfo } = useUserInfo();
  const { jwtToken } = useUserContext();

  async function loginParticle() {
    let particleUserInfo: UserInfo | undefined;
    try {
      particleUserInfo = await connect({ socialType: 'jwt', jwt: jwtToken } as any);
      console.log("particle user info(return when it's null): ", particleUserInfo);
    } catch (error) {
      console.error('loginParticle', error);
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
    if (jwtToken) {
      loginParticle();
    } else if (connected) {
      disconnect();
    }
  }, [jwtToken]);

  return { userInfo, connect, loginParticle };
}
