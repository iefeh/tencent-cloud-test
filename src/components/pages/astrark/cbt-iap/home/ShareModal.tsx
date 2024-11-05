import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react';
import { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { copyText } from '@/utils/common';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { shareCallbackAPI, shareCallbackInnerAPI } from '@/http/services/astrark';
import Link from '@/components/link';

const ShareModal: FC<DisclosureProps & { isInner?: boolean }> = ({ isInner, disclosure: { isOpen, onOpenChange } }) => {
  function onShare() {
    const text = `Come join me in the AstrArk <Marching Test>, and let’s embark on our own legendary journey together! Download Link: ${process
      .env.NEXT_PUBLIC_AA_DOWNLOAD_URL!}`;
    copyText(text);

    const api = isInner ? shareCallbackInnerAPI : shareCallbackAPI;
    api();
  }

  return (
    <Modal
      placement="center"
      isDismissable={false}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      classNames={{
        base: 'max-w-[42rem] rounded-base bg-black',
        header:
          "h-[6.25rem] flex items-center relative bg-[url('https://d3dhz6pjw7pz9d.cloudfront.net/astrark/cbt-iap/bg_modal_header.png')] bg-contain bg-left bg-no-repeat",
        body: 'px-12 pt-8 pb-8 flex flex-col justify-center relative',
        closeButton: 'z-10 text-lg',
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <div className="font-semakin text-basic-yellow text-2xl leading-none">Share</div>
            </ModalHeader>

            <ModalBody>
              <div className="flex flex-col gap-y-4">
                <div>
                  Commander, thank you for participating in the AstrArk{' '}
                  <span className="text-basic-yellow">&lt;Marching Test&gt;</span>. Please share this page to claim your
                  rewards in{' '}
                  <Link className="text-basic-yellow hover:underline" href="/">
                    moonveil.gg
                  </Link>
                  .
                </div>

                <div className="text-basic-yellow font-bold italic">* Only the first share is valid.</div>

                <div className="flex justify-center items-center mt-4">
                  <LGButton className="w-auto" label="Copy to share" onClick={onShare} />
                </div>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default observer(ShareModal);
