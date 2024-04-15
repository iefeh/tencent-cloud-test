import { BattlePassLevelDTO, claimBattleRewardAPI } from '@/http/services/battlepass';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { FC, useState } from 'react';
import RewardsBelt from './Ladder/RewardsBelt';
import Image from 'next/image';
import { throttle } from 'lodash';
import { toast } from 'react-toastify';
import { useBattlePassContext } from '@/store/BattlePass';

interface Props extends ModalProps {
  item: BattlePassLevelDTO;
  onClose?: () => void;
}

const RewardModal: FC<Props> = ({ item, isOpen, onClose, onOpenChange }) => {
  const { init } = useBattlePassContext();
  const { rewards = [], reward_type, lv, claimed_time } = item;
  const [loading, setLoading] = useState(false);
  const [currentClaimed, setCurrentClaimed] = useState(!!claimed_time);

  const onClaim = throttle(async () => {
    setLoading(true);
    const data = { reward_type: reward_type!, lv: +(lv || 0) };
    const res = await claimBattleRewardAPI(data);
    if (res.result) {
      toast.success(res.result);
    }
    await init(true);
    setCurrentClaimed(true);
    setLoading(false);
  }, 500);

  return (
    <Modal
      classNames={{ header: 'p-0', closeButton: 'z-10', body: '26.25rem' }}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClose={onClose}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <div className="relative w-full h-[6.25rem] bg-no-repeat bg-[url('/img/invite/bg_rule_head.png')] bg-contain flex items-center gap-3 px-6">
                <div className="font-semakin text-basic-yellow text-2xl">Rewards</div>
              </div>
            </ModalHeader>

            <ModalBody>
              {rewards.length !== 1 ? (
                <div className="flex flex-col items-center text-center">
                  <div className="w-40 h-40 relative mt-4">
                    <Image
                      className="object-contain"
                      src={(rewards[0]?.properties as any).image_url}
                      alt=""
                      fill
                      sizes="100%"
                    />

                    <div className="absolute right-4 bottom-4 text-basic-yellow text-sm">
                      x{(rewards[0]?.properties as any).amount || 0}
                    </div>
                  </div>

                  <div className="font-semakin text-xl bg-gradient-to-r from-[#CAA67E] to-[#EDE0B9] bg-clip-text text-transparent mt-8">
                    {(rewards[0]?.properties as any)?.name || '--'}
                  </div>

                  <div className="w-full text-sm mt-6 text-[#666666]">
                    {(rewards[0]?.properties as any)?.description || '--'}
                  </div>
                </div>
              ) : (
                <RewardsBelt items={rewards} className="mt-[3.125rem] mb-10" />
              )}
            </ModalBody>

            <ModalFooter>
              <LGButton
                className="uppercase w-full h-9"
                label={currentClaimed ? 'Claimed' : 'Claim'}
                actived
                disabled={currentClaimed || !item.satisfied_time}
                loading={loading}
                onClick={onClaim}
              />
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default RewardModal;
