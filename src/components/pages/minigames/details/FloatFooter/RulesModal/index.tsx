import { Button, Modal, ModalBody, ModalContent, ModalHeader, cn } from '@nextui-org/react';
import type { FC } from 'react';
import StrokeButton from '@/components/common/buttons/StrokeButton';
import Image from 'next/image';

const RulesModal: FC<DisclosureProps> = ({ disclosure: { isOpen, onOpenChange } }) => {
  const rules = [
    {
      content: 'Ticket Purchase Instructions',
      items: [
        'Visit our mini games page.',
        'Choose the game you wish to participate in.',
        'Click the "Buy Ticket" button.',
        'Select your payment method and complete the transaction confirmation in your wallet.',
        'Once the purchase is complete, your ticket will be recorded in your account.',
      ],
    },
    {
      content: 'Ticket Price:',
      items: [
        'The ticket price for each game may vary. Please refer to the game details page for specific ticket prices.',
      ],
    },
    {
      content: 'Ticket Validity:',
      items: [
        'Please note that tickets not used within the specified time will automatically become invalid.',
        'Once purchased, tickets are non-refundable.',
      ],
    },
    {
      content: 'Game Participation:',
      items: [
        'After successfully purchasing a ticket, you can immediately participate in the game.',
        'Each ticket is valid for one game participation only.',
      ],
    },
    {
      content: 'Game Time:',
      items: ['Each game has a specific start and end time. Please participate within the specified time.'],
    },
    {
      content: 'Game Rules:',
      items: ['Each game may have different rules and gameplay. Please refer to the game page for detailed rules.'],
    },
    {
      content: 'Winning and Rewards:',
      items: ['The winning conditions and reward rules for each game will be detailed on the game page and task page.'],
    },
    {
      content: 'Notes:',
      items: [
        'Before participating in the game, please ensure your network connection is stable. Tickets will not be refunded for game failures caused by network issues.',
        "All participants must comply with the platform's terms of use and game rules. Violators will be disqualified from participation and may face further penalties.",
      ],
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      hideCloseButton
      classNames={{
        base: 'max-w-[42.5rem] text-brown font-jcyt6 rounded-none bg-transparent shadow-none',
        header: cn([
          "bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/bg_rules_header.png')] bg-contain bg-left bg-no-repeat bg-[#F7E9CC]",
          'h-[6.25rem] mt-5 mr-6',
          'rounded-tl-base rounded-tr-base',
          'border-basic-gray border-t-2 border-l-2 border-r-2',
          'flex items-center',
        ]),
        body: cn([
          'font-jcyt4 max-h-[32.5rem] has-scroll-bar',
          'pt-8 pl-10 pr-12 pb-[2.625rem] mr-6 bg-[#F7E9CC]',
          'rounded-bl-base rounded-br-base overflow-y-scroll',
          'border-basic-gray border-b-2 border-l-2 border-r-2',
        ]),
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <Image
                className="object-contain w-[2.6875rem] aspect-square"
                src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/icons/icon_help.png"
                alt=""
                width={86}
                height={86}
                unoptimized
                priority
              />

              <span className="text-2xl ml-1">Rules</span>
            </ModalHeader>

            <ModalBody>
              {rules.map((rule, index) => (
                <div key={index}>
                  <p className='font-jcyt6'>· {rule.content}</p>

                  {rule.items && (
                    <ul>
                      {rule.items.map((item, ci) => (
                        <li key={ci} className="indent-4">
                          - {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              <Button
                className="bg-transparent bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/icons/icon_close.png')] bg-contain bg-no-repeat w-[3.625rem] h-[3.75rem] absolute top-0 right-0 p-0 min-w-0"
                onPress={onClose}
              />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default RulesModal;
