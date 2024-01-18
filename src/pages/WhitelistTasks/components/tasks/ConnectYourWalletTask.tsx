import { useState } from 'react';
import xImg from 'img/nft/whitelist/icon_x.png';
import Image from 'next/image';
import { Accordion, AccordionItem } from '@nextui-org/react';

interface Props {
  onUpdate?: () => void;
}

export default function ConnectYourWalletTask(props: Props) {
  const { onUpdate } = props;
  const [tips, setTips] = useState('');

  return (
    <div className="task-item">
      <div className="description">Connect to your crypto wallet</div>

      <div className="btn"></div>

      {tips && <div className="tips">{tips}</div>}

      <div className="explanation">
        Be sure to use the most valuable wallet to connect. The digital assets in your wallet will significantly
        increase the chance of being whitelisted
      </div>
    </div>
  );
}
