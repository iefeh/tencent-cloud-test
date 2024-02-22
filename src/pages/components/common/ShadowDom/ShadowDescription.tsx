import { useEffect, useRef } from 'react';

interface Props {
  content?: string;
  className?: string;
}

export default function ShadowDescription(props: Props) {
  const { content, className } = props;
  const shadowRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shadowRootRef.current) return;

    let shadowRoot = shadowRootRef.current.shadowRoot;

    if (!shadowRoot) {
      shadowRoot = shadowRootRef.current.attachShadow({ mode: 'open' });
    }

    shadowRoot.innerHTML = content || '';

    const style = document.createElement('style');
    style.textContent = `
      a[href] {
        padding: 0 4px;
        word-break: break-word;
        color: #6624FF;
      }
      p {
      color: #A69DBE;
      }
      p strong {
      color: #F4F1FE;
      }
      img {
        max-width: 100%;
      }
      pre {
        text-wrap: balance;
      }
    `;

    shadowRoot.appendChild(style);
  }, [content]);

  return <div ref={shadowRootRef} className={className}></div>;
}
