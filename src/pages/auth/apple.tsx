import { MediaType } from '@/constant/task';
import { connectAppleAuthAPI, loginAppleAuthAPI } from '@/http/services/login';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useScript, appleAuthHelpers } from 'react-apple-signin-auth';

async function onAppleAuth(isAuth: boolean) {
  let msg = '';
  const api = isAuth ? loginAppleAuthAPI : connectAppleAuthAPI;
  const res = await api();

  if (!res?.client_id) {
    msg = 'Get Apple client id failed!';
    return;
  }

  if (!res?.scope) {
    msg = 'Get Apple auth scope failed!';
    return;
  }

  if (!res?.redirect_uri) {
    msg = 'Get Apple redirect uri failed!';
    return;
  }

  if (!res?.state) {
    msg = 'Get Apple auth state failed!';
    return;
  }

  if (msg) {
    window.location.href = `${location.origin}/${isAuth ? 'auth' : 'auth/connect'}?type=${MediaType.APPLE}`;
    return;
  }

  console.log('apple auth server info: ', JSON.stringify(res));

  appleAuthHelpers.signIn({
    authOptions: {
      clientId: res.client_id,
      scope: res.scope,
      redirectURI: res.redirect_uri,
      state: res.state,
      /** Uses popup auth instead of redirection */
      // usePopup: true,
    },
    onError: (error: Error) => console.error(error),
  });
}

export default function AppleAuth() {
  const router = useRouter();
  useScript(appleAuthHelpers.APPLE_SCRIPT_SRC);

  useEffect(() => {
    onAppleAuth(router.query.type === 'auth');
  }, []);

  return null;
}
