import { Locale } from '@/constant/locale';
import { useUserContext } from '@/store/User';
import { observer } from 'mobx-react-lite';
import { useRef, useState } from 'react';

interface Props {
  src: string;
}

function IframeDoc(props: Props) {
  const { locale } = useUserContext();
  let { src } = props;

  if (src.startsWith('/html/')) {
    src = `/html${locale !== Locale.EN ? '/' + locale : ''}/${src.substring(6)}`;
  }

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

  function setHeight() {
    if (!iframeRef.current?.contentWindow) return;

    const height = iframeRef.current.contentWindow.document.documentElement.scrollHeight;
    iframeRef.current.height = height + 'px';
  }

  function onIframeLoad() {
    if (!iframeRef.current?.contentWindow) return;

    const body = iframeRef.current.contentWindow.document.body;
    const style = document.createElement('style');
    style.innerHTML = `
      @font-face {
        font-family: 'DecimaMonoW01-Regular';
        src: url("/fonts/Decima-Mono-W01-Regular.woff2");
      }
      
      @font-face {
        font-family: 'DecimaMonoW01-Regular';
        src: url("/fonts/Decima-Mono-W01-Regular.ttf");
      }

      @font-face {
        font-family: Semakin;
        src: url("/fonts/Semakin.woff2");
      }
      
      @font-face {
        font-family: Semakin;
        src: url("/fonts/Semakin.ttf");
      }
      :root {
        background-color: currentColor;
      }
    `;
    iframeRef.current.contentWindow.document.head.appendChild(style);

    body.style.color = '#fff';
    setTimeout(() => {
      setHeight();
      setLoaded(true);
    }, 200);
  }

  return (
    <iframe
      ref={iframeRef}
      className={'w-full transition-opacity duration-1000 ' + (loaded ? 'opacity-1' : 'opacity-0')}
      src={src}
      onLoad={onIframeLoad}
    ></iframe>
  );
}

export default observer(IframeDoc);
