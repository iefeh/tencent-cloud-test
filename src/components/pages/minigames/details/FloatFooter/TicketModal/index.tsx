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
import useBuyTickets from './useBuyTickets';
import { useMGDContext } from '@/store/MiniGameDetails';
import { observer } from 'mobx-react-lite';

const enum TicketChannel {
  MATIC = 'matic',
  MORE = 'more',
}

const TicketModal: FC<DisclosureProps> = ({ disclosure: { isOpen, onOpenChange } }) => {
  const { data, queryTickets } = useMGDContext();
  const rulesDisclosure = useDisclosure();
  const radioOptions = [
    {
      key: TicketChannel.MATIC,
      label: 'Buy with $Matic',
      isDisabled: false,
    },
    // {
    //   key: TicketChannel.MORE,
    //   label: 'Buy with $More',
    //   isDisabled: true,
    // },
  ];
  const [channel, setChannel] = useState<string>(radioOptions[0].key);
  const [ticketAmount, setTicketAmount] = useState('1');
  const [buyLoading, setBuyLoading] = useState(false);
  const { onBuyTickets } = useBuyTickets();

  const digit = data?.ticket_price_formatted ? Math.ceil(-Math.log10(+(data.ticket_price_formatted || 0))) : 0;
  const totalPrice = (+(data?.ticket_price_formatted || 0) * +ticketAmount).toFixed(digit);

  async function onBuyTicketsClick() {
    if (!data) return;

    setBuyLoading(true);
    const res = await onBuyTickets(data, +ticketAmount);
    if (res) await queryTickets();

    setBuyLoading(false);
  }

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
                      <div>{data?.ticket_price_formatted || '-'} Matic/Ticket</div>

                      <div className="flex-1 flex justify-end items-center mr-7">
                        <IntegerInput value={ticketAmount} min={1} max={10} onValueChange={setTicketAmount} />
                      </div>

                      <Tooltip
                        classNames={{
                          base: 'max-w-[36rem] rounded-base bg-white px-5 py-6 shadow-[3px_6px_9px_1px_rgba(0,0,0,0.2)]',
                          content: 'bg-transparent text-brown font-jcyt4 text-sm leading-6 p-0 shadow-none',
                        }}
                        content={
                          <ul>
                            <li>- You can purchase up to 10 tickets once.</li>
                            <li>- Tickets are non-refundable once purchased.</li>
                            <li>- Tickets have a validity period and will automatically expire after this period.</li>
                          </ul>
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

                    <p className="text-2xl leading-none mt-[0.375rem]">{totalPrice} Matic</p>

                    <div className="w-full h-0 border-t-1 border-brown border-dashed mt-6 mb-5"></div>

                    <TicketCountdown key={data?.ticket_expired_at} endTime={data?.ticket_expired_at} isBrown />

                    <div className="flex items-center mt-6">
                      <StrokeButton
                        className="w-[9.0625rem] text-yellow-1 p-0 pl-11 pt-[0.875rem]"
                        strokeType="ticket"
                        strokeText={data?.ticket.remain.toString() || '--'}
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
                        isLoading={buyLoading}
                        onPress={onBuyTicketsClick}
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

export default observer(TicketModal);
