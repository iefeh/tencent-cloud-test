import { useEffect, useLayoutEffect, useState } from "react";
import { BtnGroup } from "../LoginModal";
import { MediaType } from '@/constant/task';
import googleIconImg from 'img/login/btn_google.png';
import appleIconImg from 'img/login/btn_apple.png';
import discordIconImg from 'img/login/btn_discord.png';
import xIconImg from 'img/login/btn_x.png';
import telegramIconImg from 'img/login/btn_telegram.png';
import metamaskIconImg from 'img/login/btn_metamask.png';
import { useRouter } from "next/router";
import { isIOS } from "react-device-detect";

const defualtList: BtnGroup[] = [
  {
    title: 'Log in with social account',
    btns: [
      {
        label: 'Google',
        type: MediaType.GOOGLE,
        icon: googleIconImg,
      },
      // {
      //   label: 'Apple ID',
      //   type: MediaType.APPLE,
      //   icon: appleIconImg,
      // },
      {
        label: 'Discord',
        type: MediaType.DISCORD,
        icon: discordIconImg,
      },
      {
        label: 'Twitter',
        type: MediaType.TWITTER,
        icon: xIconImg,
      },
      {
        label: 'Telegram',
        type: MediaType.TELEGRAM,
        icon: telegramIconImg,
      },
      {
        label: 'Apple',
        type: MediaType.APPLE,
        icon: appleIconImg,
      },
      // {
      //   label: 'Facebook',
      //   type: MediaType.FACEBOOK,
      //   icon: facebookIconImg,
      // },
    ],
  },
  {
    title: 'Wallet',
    btns: [
      {
        label: 'Wallet',
        type: MediaType.METAMASK,
        icon: metamaskIconImg,
      },
    ],
  },
];

const useConnectList = () => {
  const [connectList, setConnectList] = useState<BtnGroup[]>(defualtList);
  const router = useRouter();

  const isAAIos = () => {
    const name = router?.pathname
    const params = new URLSearchParams(window.location.search);
    const clientName = params.get('client_name');

    if (name === '/oauth' && isIOS && clientName === 'AstrArk') {
      return true
    }

    return false
  }

  useLayoutEffect(() => {
    if (isAAIos()) {
      setConnectList([defualtList[0]])
    } else {
      setConnectList(defualtList)
    }
  }, [])

  return { connectList }
}

export default useConnectList;