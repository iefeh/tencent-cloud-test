import ShadowDescription from '@/pages/components/common/ShadowDom/ShadowDescription';
import { Divider } from '@nextui-org/react';
import { useState } from 'react';

interface Props {
  content?: string;
}

export default function Descriptions(props: Props) {
  const { content } = props;

  return (
    <div className="mt-20">
      <div className="font-semakin text-2xl leading-none">Descriptions</div>

      <Divider className="my-6" />

      <ShadowDescription content={content || '--'} />
    </div>
  );
}
