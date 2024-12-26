import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { debounce } from 'lodash';
import { ComponentProps, FC } from 'react';

export default function usePluginModal<T = boolean>() {
  const modal = useModal();

  return {
    disclosure: {
      isOpen: modal.visible,
      onClose: modal.hide,
    } as Partial<Disclosure>,
    onOk: (res?: T) => {
      modal.hide();
      modal.resolve(res);
    },
    onCancel: (res?: T) => {
      modal.hide();
      modal.reject(res);
    },
  };
}

export const showModal = debounce(async <T = boolean>(content: FC<any>, args?: ComponentProps<typeof content>) => {
  const Modal = NiceModal.create(content);

  try {
    // show方法传入FC类型且显式定义类型时，需要全部覆盖所有类型，且不便于声明args的类型
    const res = (await NiceModal.show(Modal, args)) as T;
    return res ?? true;
  } catch (error) {
    return false;
  }
}, 300);
