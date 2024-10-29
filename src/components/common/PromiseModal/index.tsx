/**
 *  命令行执行弹窗
 * 
 *  使用说明：
  const toSubmit = async () => {
    await sleep(1000);
    return {
      // 需要处理的数据
    }
  }

  // 自定义弹窗内容 也可自行封装，回调参考 PromiseModal 组件
  const baseModal = (
    <PromiseModal
      promiseFn={toSubmit}
    >
      <div className="text-center">xxx</div>
    </PromiseModal>
  )

  const handleOpen = async () => {
    await asyncOpenModal({
      modalCtx: baseModal,
    })
    // do something after modal closed
  }
 */

import NiceModal, { useModal, NiceModalHandler } from '@ebay/nice-modal-react';
import { Button, Modal, ModalBody, ModalContent, ModalHeader, cn, type ModalProps } from '@nextui-org/react';
import React from 'react';

interface PromiseModalProps extends ModalProps {
  children: JSX.Element;
  promiseFn: (p?: any) => Promise<any>;
  modal?: NiceModalHandler<Record<string, unknown>>
  footerClassNames?: {
    footer: string;
    okBtn: string;
    cancelBtn: string;
    header: string;
  },
  okText?: string,
  cancelText?: string,
  modalTitle?: string,
}

interface OpenPromiseModalProps {
  modalCtx: JSX.Element;
}

const asyncOpenModal = (props: OpenPromiseModalProps) => {
  const { modalCtx } = props;

  return new Promise<any>((resolve, reject) => {
    NiceModal.show(NiceModalWarpper, { children: modalCtx })
      .then((res) => {
        console.log('Resolved: ', res);
        resolve(res);
      })
      .catch((err) => {
        console.log('Rejected: ', err);
        reject(err);
      });
  })
}

const PromiseModal = (props: PromiseModalProps) => {
  const {
    children,
    promiseFn,
    modal,
    footerClassNames,
    okText = 'confirm',
    cancelText = 'close',
    modalTitle = 'modal',
    ...modalProps
  } = props;

  const { footer, okBtn, cancelBtn, header } = footerClassNames || {};

  if (!modal) return null;

  const handleOk = async () => {
    try {
      const result = await promiseFn();
      modal.resolve(result);
      modal.hide();
    } catch (error) {
      modal.reject(error);
    }
  }

  const handleCancel = () => {
    modal.reject('cancel');
    modal.hide();
  }

  const renderFooter = () => {
    return (
      <div className={cn([
        'promise-modal-footer',
        'flex items-center justify-center gap-2',
        footer,
      ])}>
        <Button
          className={cn([
            cancelBtn,
          ])}
          onClick={handleCancel}
        >
          {cancelText}
        </Button>
        <Button
          className={cn([
            okBtn,
          ])}
          onClick={handleOk}
        >
          {okText}
        </Button>
      </div>
    )
  }

  return (
    <Modal
      isOpen={modal.visible}
      onClose={modal.hide}
      {...modalProps}
    >
      <ModalContent>
        <ModalHeader
          className={cn([
            "flex flex-col gap-1",
            header
          ])}>
          {modalTitle}
        </ModalHeader>
        <ModalBody>
          {children}

          {renderFooter()}
        </ModalBody>
      </ModalContent>
    </Modal >
  )
}

const NiceModalWarpper = NiceModal.create((props: { children?: JSX.Element }) => {
  const { children } = props;

  const modal = useModal();

  const renderChildren = () => {
    if (!children) {
      return null;
    }

    return React.cloneElement(children, { modal: modal })
  }

  return (
    renderChildren()
  );
});

export {
  asyncOpenModal,
  NiceModalWarpper,
}

export default PromiseModal