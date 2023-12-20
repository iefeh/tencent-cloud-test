import { useRef } from 'react';
import useModelView from '@/hooks/useModelView';

interface Props {
  source: string;
  texture?: string;
}

export default function ModelView3D(props: Props) {
  const { source, texture } = props;
  const containerRef = useRef<HTMLDivElement>(null);

  useModelView(containerRef, source, texture);

  return <div ref={containerRef} className="inline-block w-full h-full"></div>;
}
