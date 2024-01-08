import { useContext, useEffect, useRef } from 'react';
import { MediaType, QuestType } from '@/constant/task';
import { connectDiscordAPI, connectGoogleAPI, connectSteamAPI, connectTwitterAPI } from '@/http/services/login';
import { toast } from 'react-toastify';
import { KEY_AUTHORIZATION_CONNECT } from '@/constant/storage';
import { useWeb3Modal } from '@web3modal/ethers/react';

const connectAPIs: { [key: string | MediaType | QuestType]: () => Promise<{ authorization_url: string } | undefined> } =
  {
    [QuestType.ConnectTwitter]: connectTwitterAPI,
    [QuestType.ConnectSteam]: connectSteamAPI,
    [QuestType.ConnectDiscord]: connectDiscordAPI,
    [MediaType.TWITTER]: connectTwitterAPI,
    [MediaType.STEAM]: connectSteamAPI,
    [MediaType.DISCORD]: connectDiscordAPI,
    [MediaType.GOOGLE]: connectGoogleAPI,
  };

export default function useConnect(type: string, callback?: (args?: any) => void) {
  const dialogWindowRef = useRef<Window | null>(null);
  const { open } = useWeb3Modal();

  function authConnect() {
    const tokens = localStorage.read<Dict<Dict<string>>>(KEY_AUTHORIZATION_CONNECT) || {};
    if (!tokens[type]) return;
    if (!dialogWindowRef.current) return;
    dialogWindowRef.current.close();
    dialogWindowRef.current = null;
    const { code, msg } = tokens[type] || {};
    if (+code === 1) {
      callback?.();
    } else {
      toast.error(msg);
    }
    delete tokens[type];
    localStorage.save(KEY_AUTHORIZATION_CONNECT, tokens);
  }

  function openAuthWindow(authURL: string) {
    const dialog = window.open(
      authURL,
      'Authrization',
      'width=800,height=600,menubar=no,toolbar=no,location=no,alwayRaised=yes,depended=yes,z-look=yes',
    );
    dialogWindowRef.current = dialog;
    dialog?.addEventListener('close', () => {
      dialogWindowRef.current = null;
    });
  }

  async function onConnect() {
    if (type === MediaType.METAMASK) {
      open();
      return;
    }

    const api = connectAPIs[type];
    if (!api) return;

    const res = await api();
    if (!res?.authorization_url) {
      toast.error('Get authorization url failed!');
      return;
    }

    openAuthWindow(res.authorization_url);
  }

  useEffect(() => {
    window.addEventListener('storage', authConnect);
    return () => window.removeEventListener('storage', authConnect);
  }, []);

  return { onConnect };
}
