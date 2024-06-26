import PreRegisterButton from '@/components/common/buttons/PreregisterButton';
import { claimShareRewardsAPI, preRegisterAPI, queryPreRegisterInfoAPI } from '@/http/services/bushwhack';
import { useUserContext } from '@/store/User';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/react';
import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { toast } from 'react-toastify';
import { MediaType } from '@/constant/task';
import useAuth from '@/hooks/useAuth';

const BrPreInfo: FC = () => {
  const { userInfo, toggleLoginModal, getUserInfo } = useUserContext();
  const [preCount, setPreCount] = useState(0);
  const [hasPreregistered, setHasPreregistered] = useState(false);
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const connectDisclosure = useDisclosure();
  const [btnLabel, setBtnLabel] = useState('Share For 20 Moon Beams');
  const [hasCD, setHasCD] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const { onConnect } = useAuth(MediaType.TWITTER, () => getUserInfo());

  async function queryPreCount() {
    const res = await queryPreRegisterInfoAPI();
    setPreCount(+(res?.total || 0));
    setHasPreregistered(!!res?.preregistered);
  }

  async function preregister() {
    if (!userInfo) {
      toggleLoginModal();
      return;
    }

    const res = await preRegisterAPI();
    if (!res) {
      onOpen();
      await queryPreCount();
      return;
    }

    throw new Error('Bushwhack Pre-Registration.');
  }

  async function onBtnClick() {
    if (btnLabel === 'Claim') {
      setLoading(true);
      const res = await claimShareRewardsAPI();
      setLoading(false);
      if (res?.verified) {
        toast.success(res.tip);
        onClose();
      } else {
        toast.error(res.tip);
      }
    } else {
      if (!userInfo?.twitter) {
        connectDisclosure.onOpen();
        return;
      }

      const url = process.env.NEXT_PUBLIC_X_URL_BR_PREREGISTER;
      window.open(url);
      setHasCD(true);
      setDisabled(true);
    }
  }

  useEffect(() => {
    queryPreCount();
  }, [userInfo]);

  useEffect(() => {
    if (isOpen) return;

    setHasCD(false);
    setDisabled(false);
    setBtnLabel('Share For 20 Moon Beams');
  }, [isOpen]);

  return (
    <div className="mt-8 flex items-center flex-col lg:flex-row gap-8">
      <div className="text-lg">
        <div className="font-semakin text-3xl text-basic-yellow">{preCount.toLocaleString('en-US')}</div>
        <div>Moonwalkers</div>
      </div>

      <PreRegisterButton hasPreregistered={hasPreregistered} onClick={preregister} />

      <Modal
        placement="center"
        backdrop="blur"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        classNames={{ base: 'bg-[#141414] !rounded-base max-w-[30rem]', body: 'px-8 pt-10 items-center gap-4' }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                <p className="font-poppins">
                  Dear Moonwalker, thanks for pre-registrating! Excited to embark on this adventure together!
                </p>

                <LGButton
                  className="uppercase mb-6"
                  label={btnLabel}
                  actived
                  hasCD={hasCD}
                  cd={10}
                  loading={loading}
                  disabled={disabled}
                  onClick={onBtnClick}
                  onCDOver={() => {
                    setHasCD(false);
                    setDisabled(false);
                    setBtnLabel('Claim');
                  }}
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        placement="center"
        backdrop="blur"
        isOpen={connectDisclosure.isOpen}
        onOpenChange={connectDisclosure.onOpenChange}
        classNames={{ base: 'bg-[#070707] border-1 border-[#1D1D1D] rounded-[0.625rem]' }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="font-poppins text-3xl">Welcome to Moonveil</ModalHeader>
              <ModalBody>
                <p className="font-poppins-medium text-base">
                  Your Twitter account is not connected. Please click to connect.
                </p>
              </ModalBody>
              <ModalFooter>
                <LGButton squared label="Close" onClick={onClose} />
                <LGButton
                  actived
                  squared
                  label="Connect"
                  onClick={() => {
                    onClose();
                    onConnect();
                  }}
                />
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default observer(BrPreInfo);
