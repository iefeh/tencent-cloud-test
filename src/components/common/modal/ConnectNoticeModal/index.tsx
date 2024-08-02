import { MediaType, QuestType } from '@/constant/task';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { useUserContext } from '@/store/User';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { observer } from 'mobx-react-lite';
import { FC } from 'react';

interface Props {
  disclosure: Disclosure;
  /** 账号显示文本，优先展示 */
  mediaText?: string;
  /** 账号类型，根据配置展示，第二优先级 */
  mediaType?: MediaType;
  onConnect: () => void;
}

function getAccountText(mediaType?: MediaType) {
  let text = 'account';

  switch (mediaType) {
    case MediaType.DISCORD:
      text = 'Discord account';
      break;
    case MediaType.TWITTER:
      text = 'Twitter account';
      break;
    case MediaType.STEAM:
      text = 'Steam account';
      break;
    case MediaType.TELEGRAM:
      text = 'Telegram account';
      break;
  }

  return text;
}

const ConnectNoticeModal: FC<Props> = ({ disclosure: { isOpen, onOpenChange }, mediaText, mediaType, onConnect }) => {
  const { userInfo, toggleLoginModal } = useUserContext();

  return (
    <Modal
      placement="center"
      backdrop="blur"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      classNames={{ base: 'bg-[#070707] border-1 border-[#1D1D1D] rounded-[0.625rem]' }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="font-poppins text-3xl">Welcome to Moonveil</ModalHeader>

            <ModalBody>
              <p className="font-poppins-medium text-base">
                {userInfo
                  ? `Your ${mediaText || getAccountText(mediaType)
                  } is not connected or the previous authorization has expired. Please click to reconnect.`
                  : "It seems you haven't logged in to the website. Please log in first to access the content."}
              </p>
            </ModalBody>

            <ModalFooter>
              <LGButton squared label="Close" onClick={onClose} />
              <LGButton
                actived
                squared
                label={userInfo ? 'Connect' : 'Login'}
                onClick={() => {
                  onClose();
                  if (userInfo) {
                    onConnect();
                  } else {
                    console.log('connect click');
                    toggleLoginModal();
                  }
                }}
              />
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default observer(ConnectNoticeModal);
