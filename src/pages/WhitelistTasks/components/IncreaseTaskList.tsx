import { Accordion, AccordionItem } from '@nextui-org/react';
import { ReactNode } from 'react';
import ConnectYourWalletTask from './tasks/ConnectYourWalletTask';
import Image from 'next/image';
import xImg from 'img/nft/whitelist/icon_x.png';

interface Props {
  children?: ReactNode;
  onUpdate?: () => void;
}

export default function TaskList(props: Props) {
  const { children, onUpdate } = props;

  return (
    <div className="task-list w-full">
      <div className="title text-2xl font-poppins">Increase the Chance of Being Whitelisted</div>

      <Accordion variant="splitted">
        <AccordionItem
          key="1"
          title={
            <div className="flex items-center">
              <div className="index-icon w-9 h-9">
                <Image src={xImg} alt="" />
              </div>
              <div className="title">Connect Your Wallet</div>
            </div>
          }
        >
          <ConnectYourWalletTask />
        </AccordionItem>
      </Accordion>
    </div>
  );
}
