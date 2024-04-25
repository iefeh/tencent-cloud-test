import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react';
import Image from 'next/image';
import coloredHelpIconImg from 'img/invite/icon_help_colored.png';

function InvitationRulesModal({ isOpen, onOpenChange }: ModalProps) {
  return (
    <Modal
      backdrop="blur"
      placement="center"
      isOpen={isOpen}
      classNames={{
        base: 'bg-black max-w-[42rem]',
        header: 'p-0',
        closeButton: 'z-10',
        body: 'text-[#CCCCCC] font-poppins text-base leading-[1.875rem] py-8 px-10 max-h-[37.5rem] overflow-y-auto',
      }}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <div className="relative w-full h-[6.25rem] bg-no-repeat bg-[url('/img/invite/bg_rule_head.png')] bg-contain flex items-center gap-3 px-6">
                <Image className="w-8 h-8" src={coloredHelpIconImg} alt="" />
                <div className="font-semakin text-basic-yellow text-2xl">Referral Program Rules</div>
              </div>
            </ModalHeader>

            <ModalBody>
              <ul className="[&>li:not(:first-child)]:mt-4 [&>li>p]:indent-[1em] [&>li>div]:text-lg [&>li>div]:text-white">
                <li>
                  <div>
                    · There are two types of referrals: &quot;Direct Referral&quot; and &quot;Indirect Referral.&quot;
                  </div>

                  <p>
                    - Successful direct referrals earn +30 Moon Beams per person, while successful indirect referrals
                    earn +5 Moon Beams per person, with no upper limit.
                  </p>

                  <p>
                    - Please note that only new users who receive the{' '}
                    <a
                      className="text-basic-yellow hover:underline"
                      href="/LoyaltyProgram/event?id=6becf936-fdf6-4807-876f-552d723b3c4a"
                      target="_blank"
                    >
                      Novice Notch Badge
                    </a>{' '}
                    are counted as successful registration. The Novice Notch Badge can be obtained by completing Social
                    Media Connection tasks.
                  </p>

                  <p>
                    - New users registered on our website through an invitation code or link receive a reward of +15
                    Moon Beams.
                  </p>
                </li>

                <li>
                  <div>· For example, if A refers B, and B refers C:</div>

                  <p>- A earns +30 MBs for directly referring B and +5 MBs for indirectly referring C.</p>

                  <p>- B earns +15 MBs for being referred by A.</p>
                </li>

                <li>
                  <div>
                    · If the invitee completes the Wallet Connection task, the inviter also receives an additional Moon
                    Beams based on the level of Badges rewarded.
                  </div>
                </li>

                <li>
                  <div>
                    · The inviter will receive continuous rewards for invitees&apos; in-game engagements and
                    achievements.
                  </div>
                </li>

                <li>
                  <div>
                    · Moonveil will conduct a secondary verification of the referral results. Moon Beams gained through
                    inappropriate bot behavior will be cleared.
                  </div>
                </li>
              </ul>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default InvitationRulesModal;
