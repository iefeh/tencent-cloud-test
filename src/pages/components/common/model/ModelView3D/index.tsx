import { forwardRef, useImperativeHandle, useRef } from 'react';
import useModelView from '@/hooks/useModelView';

interface Props {
  info: ModelInfo;
}

const ModelView3D = forwardRef<HTMLDivElement, Props>(function ModelView3D(props, ref) {
  const { info } = props;
  const containerRef = useRef<HTMLDivElement>(null);

  const { reset } = useModelView(containerRef, info);
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
