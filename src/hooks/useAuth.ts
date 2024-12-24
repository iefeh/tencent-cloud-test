import { throttle } from 'lodash';
import { useContext, useEffect, useRef, useState } from 'react';
import { MediaType } from '@/constant/task';
import { loginByMediaAPI, loginByTelegramAPI, loginTelegramAuthAPI, getTelegramAuthData } from '@/http/services/login';
import { TelegramLoginData } from '@/http/services/login';
import { toast } from 'react-toastify';
import { KEY_AUTHORIZATION, KEY_AUTHORIZATION_AUTH, KEY_PARTICLE_TOKEN, KEY_SIGN_UP_CRED } from '@/constant/storage';
import { MobxContext } from '@/pages/_app';
import useWatchStorage from './useWatchStorage';
import { appendQueryParamsToUrl } from '@/lib/common/url';
import useWalletAuth from './useWalletAuth';

export default function useAuth(type: string, callback?: (args?: any) => void) {
  const store = useContext(MobxContext);
  const dialogWindowRef = useRef<Window | null>(null);
  const [loading, setLoading] = useState(false);
  const { loading: waLoading, onWalletAuth } = useWalletAuth({ callback });

  const authConnect = throttle(function () {
    const tokens = localStorage.read<Dict<Dict<string>>>(KEY_AUTHORIZATION_AUTH) || {};
    if (!tokens[type]) return;
    const { code, msg, signup_cred } = tokens[type] || {};
    console.log(232432, type, code, msg);
    if (+code !== 1) {
      toast.error(msg);
    }
    delete tokens[type];
    localStorage.save(KEY_AUTHORIZATION_AUTH, tokens);

    if (signup_cred) {
      localStorage.setItem(KEY_SIGN_UP_CRED, signup_cred || '');
      store.toggleNewUserModal(undefined, { is_new_user: true, login_type: type as MediaType, wallet_type: '' });
    } else {
      store.initLoginInfo({ is_new_user: false, login_type: type as MediaType, wallet_type: '' });
      callback?.();
    }

    if (!dialogWindowRef.current) return;
    dialogWindowRef.current.close();
    dialogWindowRef.current = null;
  }, 500);

  const { startWatch, stopWatch } = useWatchStorage({ key: KEY_AUTHORIZATION_AUTH, callback: authConnect });

  function openAuthWindow(authURL: string) {
    setTimeout(() => {
      const dialog = window.open(
        authURL,
        'Authrization',
        'width=800,height=600,menubar=no,toolbar=no,location=no,alwayRaised=yes,depended=yes,z-look=yes',
      );
      dialogWindowRef.current = dialog;
      dialog?.addEventListener('close', () => {
        dialogWindowRef.current = null;
      });
    }, 0);
  }

  function openTelegramAuthWindow(res: TelegramAuthDto) {
    setTimeout(() => {
      const dialog = window.open(
        appendQueryParamsToUrl(res.authorization_url, {
          bot_id: res.bot_id,
          origin: res.origin,
          return_to: res.redirect_url,
          request_access: 'write',
        }),
        'Authrization',
        'width=800,height=600,menubar=no,toolbar=no,location=no,alwayRaised=yes,depended=yes,z-look=yes',
      );
      dialogWindowRef.current = dialog;
      window.addEventListener('message', onTelegramMessage);
      dialogWindowRef.current?.focus();
      checkTelegramAuthWindowClose(res);
    }, 0);
  }

  async function onTelegramConnect() {
    setLoading(true);
    const res = await loginTelegramAuthAPI();
    if (!res?.authorization_url) {
      toast.error('Get telegram authorization url failed!');
      setLoading(false);
      return;
    }

    if (!res?.bot_id) {
      toast.error('Get telegram bot id failed!');
      setLoading(false);
      return;
    }

    openTelegramAuthWindow(res);
    startWatch();
  }

  async function onTelegramMessage(event: MessageEvent) {
    let data: { event: string; result: TelegramLoginData };
    try {
      if (typeof event.data === 'string') {
        console.log('onTelegramMessage event data: ', event.data);
        data = JSON.parse(event.data);
      } else if (typeof event.data === 'object') {
        console.log('onTelegramMessage event data object: ', JSON.stringify(event.data));
        data = event.data;
      } else {
        console.log('onTelegramMessage event data: ', event.data);
        throw 'onTelegramMessage Invalid event data!';
      }

      if (data.event === 'auth_result') {
        onTelegramAuthDone(data.result);
      }
    } catch (error) {
      console.log(error);
    } finally {
      window.removeEventListener('message', onTelegramMessage);
      setLoading(false);
      callback?.();
    }
  }

  async function onTelegramAuthDone(authData: TelegramLoginData) {
    try {
      const res = await loginByTelegramAPI(authData);
      if (!res) throw new Error('Login Failed');

      const { token, particle_jwt, signup_cred } = res || {};
      localStorage.setItem(KEY_AUTHORIZATION, token);
      localStorage.setItem(KEY_PARTICLE_TOKEN, particle_jwt);
      if (signup_cred) {
        store.toggleNewUserModal(true, { is_new_user: true, login_type: MediaType.TELEGRAM, wallet_type: '' });
        localStorage.setItem(KEY_SIGN_UP_CRED, signup_cred || '');
        throw new Error('Is New User');
      } else {
        await store.initLoginInfo({ is_new_user: false, login_type: MediaType.TELEGRAM, wallet_type: '' });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function checkTelegramAuthWindowClose(options: TelegramAuthDto) {
    if (!dialogWindowRef.current) return;
    if (!dialogWindowRef.current.window || dialogWindowRef.current.window.closed) {
      try {
        const authData = await getTelegramAuthData(options);
        if (!authData || !authData.user) {
          throw 'checkTelegramAuthWindowClose get telegram auth data failed';
        }

        console.log('checkTelegramAuthWindowClose: ', authData.user);
        onTelegramAuthDone(authData.user);
      } catch (e) {
        console.log(e);
      } finally {
        window.removeEventListener('message', onTelegramMessage);
        setLoading(false);
        callback?.();
        return;
      }
    }

    setTimeout(checkTelegramAuthWindowClose, 100, options);
  }

  async function onConnect() {
    if (type === MediaType.EMAIL) {
      return;
    }

    if (type === MediaType.METAMASK) {
      startWatch();
      await onWalletAuth();
      return;
    }

    if (type === MediaType.TELEGRAM) {
      try {
        await onTelegramConnect();
      } catch (error) {
        console.log(error);
      }
      return;
    }

    if (type === MediaType.APPLE) {
      startWatch();
      openAuthWindow('/auth/appleAuth');
      return;
    }

    if (!type) {
      toast.error('Invalid authorization type!');
      return;
    }

    setLoading(true);
    const res = await loginByMediaAPI(type);
    if (!res?.authorization_url) {
      toast.error('Get authorization url failed!');
      setLoading(false);
      return;
    }

    openAuthWindow(res.authorization_url);
    startWatch();
    setLoading(false);
  }

  useEffect(() => {
    return () => {
      stopWatch();
    };
  }, []);

  return { onConnect, loading: loading || waLoading };
}
