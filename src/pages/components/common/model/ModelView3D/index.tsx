import { forwardRef, useImperativeHandle, useRef } from 'react';
import useModelView from '@/hooks/useModelView';
import { Button, Modal, ModalBody, ModalContent, ModalFooter } from '@nextui-org/react';

interface Props {
  source: string;
  texture?: string;
}

interface ModelView3DModalProps extends Props {
  isOpen: boolean;
  onOpenChange: any;
}

export function ModelView3DModal(props: ModelView3DModalProps) {
  const { isOpen, onOpenChange, source, texture } = props;
  const viewRef = useRef(null);

  function onReset() {
    (viewRef.current as any).reset();
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="full" classNames={{ base: 'bg-black' }}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <ModelView3D ref={viewRef} source={source} texture={texture} />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onReset}>
                Reset
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

const ModelView3D = forwardRef<HTMLDivElement, Props>(function ModelView3D(props, ref) {
  const { source, texture } = props;
  const containerRef = useRef<HTMLDivElement>(null);

  const { reset } = useModelView(containerRef, source, texture);
  useImperativeHandle(
    ref,
    () =>
      ({
        reset,
      } as any),
    [],
  );

  return <div ref={containerRef} className="inline-block w-full h-full"></div>;
});

export default ModelView3D;
