import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  Radio,
  RadioGroup,
  Tooltip,
  cn,
  useDisclosure,
} from '@nextui-org/react';
import { useState, type FC } from 'react';
import StrokeButton from '@/components/common/buttons/StrokeButton';
import Image from 'next/image';
import TicketCountdown from '../../TicketCountdown';
import RulesModal from '../RulesModal';
import IntegerInput from '@/components/common/inputs/IntegerInput';

const enum TicketChannel {
  MATIC = 'matic',
  MORE = 'more',
}

const TicketModal: FC<DisclosureProps> = ({ disclosure: { isOpen, onOpenChange } }) => {
  const rulesDisclosure = useDisclosure();
  const radioOptions = [
    {
      key: TicketChannel.MATIC,
      label: 'Buy with $Matic',
    },
    {
      key: TicketChannel.MORE,
      label: 'Buy with $More',
      isDisabled: true,
    },
  ];
  const [channel, setChannel] = useState<string>(radioOptions[0].key);
  const [ticketAmount, setTicketAmount] = useState('1');

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        hideCloseButton
        classNames={{
          base: 'max-w-[71.5625rem] text-brown rounded-none bg-transparent shadow-none',
          body: 'pl-0 pb-0 pt-5 pr-6',
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                <div className="relative w-[70rem] h-[34.8125rem] overflow-hidden pt-[3.125rem] pl-8 pr-12 pb-8 font-jcyt6 text-brown z-0 flex gap-x-[3.75rem]">
                  <Image
                    className="object-cover"
                    src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/bg_modal_ticket.png"
                    alt=""
                    fill
                    sizes="100%"
                    unoptimized
                    priority
                  />

                  <div className="flex flex-col justify-between relative z-0 h-full">
                    <div className="text-3xl leading-none">[ $300 ] Puffy 2048</div>

                    <div className="relative w-[26rem] aspect-square rounded-md overflow-hidden">
                      <Image
                        className="object-contain"
                        src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/ticket.png"
                        alt=""
                        fill
                        sizes="100%"
                        unoptimized
                        priority
                      />
                    </div>
                  </div>

                  <div className="relative z-0 flex-1">
                    <div className="flex justify-end">
                      <Button className="bg-[#E0D1B1] !rounded-five text-inherit" onPress={rulesDisclosure.onOpen}>
                        Rules
                      </Button>
                    </div>

                    <RadioGroup
                      value={channel}
                      orientation="horizontal"
                      classNames={{ base: 'mt-6', wrapper: 'bg-[#E0D1B1] rounded-base px-[1.625rem] py-4' }}
                      onValueChange={setChannel}
                    >
                      {radioOptions.map((option, index) => (
                        <Radio
                          key={index}
                          value={option.key}
                          isDisabled={option.isDisabled}
                          classNames={{
                            label: 'text-inherit',
                            wrapper: cn([
                              "bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/icons/icon_circle.png')] bg-contain bg-no-repeat",
                              "group-data-[selected=true]:bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/icons/icon_circle_active.png')]",
                              'border-none !bg-transparent',
                            ]),
                            control: 'group-data-[selected=true]:hidden',
                          }}
                        >
                          {option.label}
                        </Radio>
                      ))}
                    </RadioGroup>

                    <p className="text-lg leading-none mt-4">Network: Polygon</p>

                    <div className="w-full h-0 border-t-1 border-brown border-dashed mt-7 mb-[1.125rem]"></div>

                    <div className="flex items-center">
                      <div>0.01 Matic/Ticket</div>

                      <div className="flex-1 flex justify-end items-center mr-7">
                        <IntegerInput value={ticketAmount} min={1} max={10} onValueChange={setTicketAmount} />
                      </div>

                      <Tooltip
                        classNames={{
                          base: 'max-w-[31.25rem] rounded-base bg-white px-5 py-6 shadow-[3px_6px_9px_1px_rgba(0,0,0,0.2)]',
                          content: 'bg-transparent text-brown font-jcyt4 text-sm leading-6 p-0 shadow-none',
                        }}
                        content={
                          <div className="">
                            A charming game series by Moonveil featuring Puffy the cat. With delightful cartoon graphics
                            and simple, intuitive gameplay, it&apos;s perfect for players of all ages. Join our vibrant
                            community and dive into the playful world of Moonveil Mini today!
                          </div>
                        }
                      >
                        <Image
                          className="object-contain w-8 h-8"
                          src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/icons/icon_question.png"
                          alt=""
                          width={64}
                          height={64}
                          unoptimized
                          priority
                        />
                      </Tooltip>
                    </div>

                    <p className="font-jcyt4 text-sm leading-none mt-4">Total Price</p>

                    <p className="text-2xl leading-none mt-[0.375rem]">300 Matic</p>

                    <div className="w-full h-0 border-t-1 border-brown border-dashed mt-6 mb-5"></div>

                    <TicketCountdown />

                    <div className="flex items-center mt-6">
                      <StrokeButton
                        className="w-[9.0625rem] !rounded-xl text-yellow-1 p-0 pl-11 pt-[0.875rem] cursor-default"
                        strokeType="ticket"
                        strokeText="10"
                        startContent={
                          <span className="absolute top-0 right-[0.375rem] text-sm leading-none text-brown">
                            Your Tickets
                          </span>
                        }
                      />

                      <StrokeButton
                        className="ml-ten"
                        strokeType="blue"
                        strokeText="Buy Tickets"
                        isDisabled={+ticketAmount < 1 || +ticketAmount > 10}
                      />

                      <StrokeButton
                        className="ml-ten w-56"
                        strokeType="yellow"
                        strokeText="Exchange Tickets"
                        isDisabled
                        style={{
                          backgroundImage:
                            "url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/btn_yellow_long.png')",
                        }}
                      />
                    </div>
                  </div>
                </div>

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

      <RulesModal disclosure={rulesDisclosure} />
    </>
  );
};

export default TicketModal;
