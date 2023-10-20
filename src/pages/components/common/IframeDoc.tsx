import { useRef, useState } from 'react';

interface Props {
  src: string;
}

export default function IframeDoc(props: Props) {
  const { src } = props;
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
