import type { NFTItem } from '@/http/services/mint';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react';
import { FC } from 'react';
import AssetCard from './AssetCard';

interface Props {
  disclosure: Disclosure;
  item: Partial<NFTItem>;
  onSwitchDisplay?: (item?: Partial<NFTItem>) => void;
}

const AssetModal: FC<Props> = ({ item, disclosure, onSwitchDisplay }) => {
  return (
    <Modal
      isOpen={disclosure.isOpen}
      onOpenChange={disclosure.onOpenChange}
      classNames={{
        base: "bg-transparent shadow-none max-w-[51.6875rem] aspect-[827/416] bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/assets/bg_modal.png')] bg-contain bg-no-repeat pl-[3.125rem] pr-16 pb-16 justify-between font-fzdb",
        header: 'pt-10 pl-0 leading-none',
        body: 'p-0 block !flex-0',
        closeButton:
          "text-transparent w-[6.9375rem] aspect-[111/76] hover:bg-transparent active:bg-transparent bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/assets/icon_close.png')] bg-contain bg-no-repeat top-0 right-0",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>NFT</ModalHeader>

            <ModalBody>
              <AssetCard inModal isDisplayed item={item} onSwitchDisplay={onSwitchDisplay} />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AssetModal;
