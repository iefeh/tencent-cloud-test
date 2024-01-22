import BasicButton from '@/pages/components/common/BasicButton';
import { useContext } from 'react';
import { MintContext } from '..';
import { observer } from 'mobx-react-lite';

function MintButtons() {
  const { mintInfo, onMintOperation } = useContext(MintContext);

  return (
    <div className="mt-5">
      <BasicButton label={mintInfo.buttonLabel} active onClick={onMintOperation} />
    </div>
  );
}

export default observer(MintButtons);
