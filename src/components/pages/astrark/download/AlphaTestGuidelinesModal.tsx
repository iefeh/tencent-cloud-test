import LGButton from '@/pages/components/common/buttons/LGButton';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react';
import type { FC } from 'react';

const AlphaTestGuidelinesModal: FC<{ disclosure: Disclosure }> = ({ disclosure: { isOpen, onOpenChange } }) => {
  // TODO 替换弹窗文案
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      classNames={{ base: 'max-w-[50rem]', header: 'p-0', body: 'pb-4' }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader>
              <div className="relative w-full h-16 bg-no-repeat bg-[url('/img/invite/bg_rule_head.png')] bg-contain flex items-center gap-3 px-6">
                <div className="font-semakin text-basic-yellow text-2xl">Alpha Test Guidelines</div>
              </div>
            </ModalHeader>

            <ModalBody>
              <p>
                <span className="text-basic-yellow">Step 1</span>&nbsp;&nbsp;Tap Settings &gt; General &gt; Profiles or
                Profiles & Device Management. Under the &quot;Enterprise App&quot; heading, you see a profile for the
                developer.
              </p>

              <p>
                <span className="text-basic-yellow">Step 2</span>&nbsp;&nbsp;Tap the name of the developer profile under
                the Enterprise App heading to establish trust for this developer. Then you see a prompt to confirm your
                choice. After you trust this profile, you can manually install other apps from the same developer and
                open them immediately. This developer remains trusted until you use the Delete App button to remove all
                apps from the developer.
              </p>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AlphaTestGuidelinesModal;
