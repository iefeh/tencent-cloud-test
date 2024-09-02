import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react';
import Image from 'next/image';
import { FC } from 'react';
import coloredHelpIconImg from 'img/invite/icon_help_colored.png';
import { useBattlePassContext } from '@/store/BattlePass';
import { observer } from 'mobx-react-lite';

interface Props {
  isOpen?: boolean;
  onOpenChange?: (val?: boolean) => void;
}

const RuleModal: FC<Props> = ({ isOpen, onOpenChange }) => {
  // const { info } = useBattlePassContext();
  // const { all_requirements: { badge = [], nft = [] } = {} } = info || {};
  const nft: string[] = ['Moonveil’s Destiny TETRA NFT', 'Moonveil’s Eternity TETRA NFT'];
  const badge: string[] = [
    'Steam Era Badge Lv 4 or above',
    'Opulent Overlord Badge Lv 5 or above',
    'Fortune Maestro Badge Lv 3 or above',
    'X Factor Badge Lv 4 or above',
    'AstrArk Alpha Tester Badge Lv5',
    "Diplomat's Insignia Badge Lv6 or above",
    'Lucky Draw Master Badge Lv4 or above',
  ];
  return (
    <Modal
      backdrop="blur"
      placement="center"
      isOpen={isOpen}
      classNames={{
        base: 'bg-black max-w-[40rem]',
        header: 'p-0',
        closeButton: 'z-10',
        body: 'text-[#CCCCCC] font-poppins text-base leading-[1.875rem] pt-8 pb-[5] px-10 max-h-[37.5rem] overflow-y-auto',
      }}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <div className="relative w-full h-[6.25rem] bg-no-repeat bg-[url('/img/invite/bg_rule_head.png')] bg-contain flex items-center gap-3 px-6">
                <Image className="w-8 h-8" src={coloredHelpIconImg} alt="" />
                <div className="font-semakin text-basic-yellow text-2xl">Season Pass Rules</div>
              </div>
            </ModalHeader>

            <ModalBody>
              <p>
                Ready to embark on an exciting journey to the moon with the &quot;Rock&apos;it to the Moon&quot; Season?
                Here&apos;s how it works:
              </p>

              <ul>
                <li className="text-basic-yellow">
                  <b>1. How to level up?</b>
                </li>

                <li className="indent-[1em]">
                  · Your Season Pass level increases based on the number of tasks you complete. Complete more tasks to
                  level up.
                </li>
              </ul>

              <ul>
                <li className="text-basic-yellow">
                  <b>2. What can I win during this Season?</b>
                </li>

                <li className="indent-[1em]">
                  · <span className="text-white">Moon Beams</span>: You can win extra Moon Beams and redeem a series of
                  rewards in our ecosystem.
                </li>

                <li className="indent-[1em]">
                  · <span className="text-white">Moonrise ($MORE) Token Airdrop</span>: The more Moon Beams you earn,
                  the more share of our soon-to-come ecosystem token $MORE you can exchange.{' '}
                </li>

                <li className="indent-[1em]">
                  · <span className="text-white">Exclusive Season Badge</span>: Collect the S1 Thruster Badge
                  Collection.
                </li>

                <li className="indent-[1em]">
                  · <span className="text-white">In-game Rewards</span>: Win exclusive in-game items for Moonveil&apos;s
                  games.
                </li>

                <li className="indent-[1em]">
                  · <span className="text-white">More surprises</span>: Stay tuned for more exciting rewards.
                </li>
              </ul>

              <ul>
                <li className="text-basic-yellow">
                  <b>3. How to claim the Standard Season Pass?</b>
                </li>

                <li className="indent-[1em]">
                  · All Moonwalkers who registered on Moonveil’s website can automatically claim a Standard Season Pass.
                </li>
              </ul>

              <ul>
                <li className="text-basic-yellow">
                  <b>4. How to claim the Premium Season Pass?</b>
                </li>

                <li className="indent-[1em]">
                  <div>· Moonwalkers can claim the Premium Season Pass by meeting these requirements:</div>
                  <p className="indent-[2em]">
                    <div>Holders of selected NFTs, including the following collections:</div>
                    {nft.map((item, index) => (
                      <div key={index} className="indent-[3em]">
                        - {item}
                      </div>
                    ))}
                    <div className="indent-[3em]">- More supported NFT collections coming soon</div>
                  </p>
                  <p className="indent-[2em]">
                    <div>Holders of selected Moonveil Badges and SBTs, including:</div>
                    {badge.map((item, index) => (
                      <div key={index} className="indent-[3em]">
                        - {item}
                      </div>
                    ))}
                    <div className="indent-[3em]">- More supported Badges coming soon</div>
                  </p>
                  <p className="indent-[2em]">Stay tuned for more ways to acquire the premium season pass.</p>
                  <p className="indent-[2em]">
                    You can win those badges by completing our season{' '}
                    <a className="text-basic-yellow underline" href="/LoyaltyProgram/season/foresight" target="_blank">
                      Tasks and Events
                    </a>
                    . Check more details from the{' '}
                    <a className="text-basic-yellow underline" href="/Profile/MyBadges" target="_blank">
                      Badge Center
                    </a>
                    .
                  </p>
                  <p className="indent-[2em] text-basic-yellow font-bold">
                    * Please note that Premium Reward benefits start from the moment you claim your Premium Pass.
                    Unclaimed rewards will not be compensated, so claim early for the best advantage!
                  </p>
                </li>
              </ul>

              <ul>
                <li className="text-basic-yellow">
                  <b>5. Important info to know:</b>
                </li>

                <li className="indent-[1em]">
                  <div>
                    TETRA NFT Holder Bonus: Holders of any Moonveil ecosystem NFTs are eligible for bonus rewards after
                    holding them for over 24 hours in selected season events.
                  </div>
                  <p className="indent-[2em]">Destiny TETRA NFT: +10% MBs per item.</p>
                  <p className="indent-[2em]">Eternity TETRA NFT: +45% MBs per item.</p>
                </li>
              </ul>

              <p className="text-basic-yellow text-lg">Let&apos;s rock it to the moon together!</p>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default observer(RuleModal);
