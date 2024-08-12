import { Button, Modal, ModalBody, ModalContent, ModalHeader, cn } from '@nextui-org/react';
import type { FC } from 'react';
import StrokeButton from '@/components/common/buttons/StrokeButton';
import Image from 'next/image';

const RulesModal: FC<DisclosureProps> = ({ disclosure: { isOpen, onOpenChange } }) => {
  const rules = [
    {
      content: 'Daily check-ins reward 2 Moon Beams.',
    },
    {
      content: 'Accumulate 7 consecutive days to receive the Daily Devotee badge and extra Moon Beams.',
    },
    {
      content: 'Continued check-ins lead to badge upgrades, with additional Moon Beams awarded as follows:',
      items: [
        '7 days: Level 1, +20 Moon Beams',
        '20 days: Level 2, +40 Moon Beams',
        '40 days: Level 3, +60 Moon Beams',
        '60 days: Level 4, +80 Moon Beams',
        '80 days: Level 5, +100 Moon Beams',
        '100 days: Level 6, +120 Moon Beams',
        '120 days: Level 7, +140 Moon Beams',
        '140 days: Level 8, +160 Moon Beams',
        '160 days: Level 9, +180 Moon Beams',
        '200 days: Level 10, +200 Moon Beams',
      ],
    },
    {
      content: 'Achieve a full-level badge with 200 cumulative days in a year.',
    },
    {
      content:
        'Three free retroactive check-ins annually; subsequent ones cost Moon Beams: 5 MB for the 4th, 10 MB for the 5th, and so forth.',
    },
    {
      content: 'A new badge will be issued at the start of the second year.',
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
          'font-jcyt4',
          'pt-8 pl-10 pr-12 pb-[2.625rem] mr-6 bg-[#F7E9CC]',
          'rounded-bl-base rounded-br-base overflow-hidden',
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
                  <p>· {rule.content}</p>

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
                data-text="Play Now"
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
