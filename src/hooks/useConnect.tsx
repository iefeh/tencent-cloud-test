import { throttle } from 'lodash';
import { useContext, useEffect, useRef, useState } from 'react';
import { MediaType } from '@/constant/task';
import {
  connectMediaAPI,
  connectTelegramAuthAPI,
  connectTelegramAPI,
  connectAppleAPI,
  connectAppleAuthAPI,
  getTelegramAuthData,
} from '@/http/services/login';
import { TelegramLoginData } from '@/http/services/login';
import { toast } from 'react-toastify';
import { KEY_AUTHORIZATION_CONNECT } from '@/constant/storage';
import { useWeb3ModalAccount } from '@web3modal/ethers/react';
import { MobxContext } from '@/pages/_app';
import { useDisclosure } from '@nextui-org/react';
import useWatchStorage from './useWatchStorage';
import { appendQueryParamsToUrl } from '@/lib/common/url';
import useWalletAuth from './useWalletAuth';
import { useScript, appleAuthHelpers } from 'react-apple-signin-auth';

export default function useConnect(type: string, callback?: (args?: any) => void) {
  useScript(appleAuthHelpers.APPLE_SCRIPT_SRC);
  const { userInfo, toggleLoginModal } = useContext(MobxContext);
  const dialogWindowRef = useRef<Window | null>(null);
  const [loading, setLoading] = useState(false);
  const { address, isConnected } = useWeb3ModalAccount();
  const bindTipsDisclosure = useDisclosure();
  const { loading: waLoading, onWalletAuth } = useWalletAuth({ isConnect: true, callback });

  const authConnect = throttle(function () {
    const tokens = localStorage.read<Dict<Dict<string>>>(KEY_AUTHORIZATION_CONNECT) || {};
    if (!tokens[type]) return;
    dialogWindowRef.current?.close();
    dialogWindowRef.current = null;
    const { code, msg } = tokens[type] || {};
    if (+code === 1) {
      callback?.();
    } else {
      if (msg) {
        toast.error(msg);
      }

      if ([-9, -13, -16].includes(+code)) {
        bindTipsDisclosure.onOpen();
      }
    }
    delete tokens[type];
    localStorage.save(KEY_AUTHORIZATION_CONNECT, tokens);
  }, 500);

  const { startWatch, stopWatch } = useWatchStorage({ key: KEY_AUTHORIZATION_CONNECT, callback: authConnect });

  function openAuthWindow(authURL: string) {
    setTimeout(() => {
      const dialog = window.open(
        authURL,
        'Authrization',
        'width=800,height=600,menubar=no,toolbar=no,location=no,alwayRaised=yes,depended=yes,z-look=yes',
      );
      dialogWindowRef.current = dialog;
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
    const res = await connectTelegramAuthAPI();
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
    setTimeout(() => {}, 0);
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
    }
  }

  async function onTelegramAuthDone(authData: TelegramLoginData) {
    await connectTelegramAPI(authData);
    callback?.();
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
        return;
      }
    }

    setTimeout(checkTelegramAuthWindowClose, 100, options);
  }

  async function onAppleAuth() {
    setLoading(true);
    const res = await connectAppleAuthAPI();

    if (!res?.client_id) {
      toast.error('Get Apple client id failed!');
      setLoading(false);
      return;
    }

    if (!res?.scope) {
      toast.error('Get Apple auth scope failed!');
      setLoading(false);
      return;
    }

    if (!res?.redirect_uri) {
      toast.error('Get Apple redirect uri failed!');
      setLoading(false);
      return;
    }

    if (!res?.state) {
      toast.error('Get Apple auth state failed!');
      setLoading(false);
      return;
    }

    const response = await appleAuthHelpers.signIn({
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

    if (response) {
      console.log('Apple auth response: ', response);
      await connectAppleAPI(response);
      callback?.();
    } else {
      console.error('Error performing apple signin.');
    }

    setLoading(false);
  }

  async function onConnect() {
    if (!userInfo) {
      console.log('connect no userInfo');
      toggleLoginModal(true);
      return;
    }

    if (type === MediaType.EMAIL) {
      console.log('connect email');
      toggleLoginModal(true, true);
      return;
    }

    if (type === MediaType.METAMASK) {
      startWatch();
      await onWalletAuth();

      return;
    }

    if (type === MediaType.TELEGRAM) {
      await onTelegramConnect();
      return;
    }

    if (type === MediaType.APPLE) {
      startWatch();
      await onAppleAuth();
      return;
    }

    if (!type) {
      toast.error('Invalid authorization type!');
      return;
    }

    setLoading(true);

    const res = await connectMediaAPI(type);
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

  return { isConnected, address, onConnect, loading: loading || waLoading, bindTipsDisclosure };
}
