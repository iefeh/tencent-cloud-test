import { useEffect } from 'react';
import thinkingdata from 'thinkingdata-browser';

export default function useEventTracking() {
  const config = {
    appId: process.env.NEXT_PUBLIC_TA_APP_ID,
    serverUrl: process.env.NEXT_PUBLIC_TA_SERVER_URL,
    autoTrack: {
      pageShow: true, //开启页面展示事件，事件名ta_page_show
      pageHide: true, //开启页面隐藏事件，事件名ta_page_hide
    },
  };

  useEffect(() => {
    thinkingdata.init(config);
    window.ta = thinkingdata;
  }, []);
}
