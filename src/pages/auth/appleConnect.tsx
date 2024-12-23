import { MediaType } from '@/constant/task';
import { connectAppleAuthAPI } from '@/http/services/login';
import { useEffect } from 'react';
import { useScript, appleAuthHelpers } from 'react-apple-signin-auth';
import { appendQueryParamsToUrl } from '@/lib/common/url';
import * as response from '@/lib/response/response';

async function onAppleConnect() {
  let msg = '';
  const res = await connectAppleAuthAPI();

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
    window.location.href = `${location.origin}/auth/connect?type=${MediaType.APPLE}`;
    return;
  }

  console.log('apple auth server info: ', JSON.stringify(res));
  setTimeout(async () => {
    window.location.href = appendQueryParamsToUrl(
      `${location.origin}/auth/connect?type=${MediaType.APPLE}`,
      response.siwaExpired(),
    );
  }, 60000);

  appleAuthHelpers.signIn({
    authOptions: {
      clientId: res.client_id,
      scope: res.scope,
      redirectURI: res.redirect_uri,
      state: res.state,
      // usePopup: true,
    },
  });
}

export default function AppleAuth() {
  useScript(appleAuthHelpers.APPLE_SCRIPT_SRC);

  useEffect(() => {
    onAppleConnect();
  }, []);

  return null;
}
