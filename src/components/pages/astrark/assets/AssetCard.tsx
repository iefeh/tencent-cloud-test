import { FC, useState } from 'react';
import NFT from './NFT';
import type { NFTItem } from '@/http/services/mint';
import dayjs from 'dayjs';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { Tooltip, cn } from '@nextui-org/react';

interface Props {
  inModal?: boolean;
  item: Partial<NFTItem> | null;
  isDisplayed?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onSwitchDisplay?: (item?: Partial<NFTItem>) => void;
}

const AssetCard: FC<Props> = ({ inModal, item, isDisplayed, disabled, onSwitchDisplay }) => {
  const [loading, setLoading] = useState(false);

  async function onDisplayClick() {
    if (!item) return;

    setLoading(true);
    await onSwitchDisplay?.(item);
    setLoading(false);
  }

  return (
    <div className={cn(['shrink-0 flex font-fzdb'])}>
      <NFT
        className={cn([
          'h-auto aspect-square',
          inModal
            ? "!w-[15.875rem] bg-[url('https://d3dhz6pjw7pz9d.cloudfront.net/astrark/assets/bg_asset_shadow_modal.png')] bg-contain bg-no-repeat"
            : '!w-[23.625rem] bg-black',
        ])}
        src={
          item?.token_metadata?.animation_url ||
          item?.token_metadata?.image ||
          'https://d3dhz6pjw7pz9d.cloudfront.net/astrark/assets/bg_asset_null.png'
        }
        nftClassName={inModal ? 'bg-black' : ''}
        isSrcImage={!item?.token_metadata?.animation_url}
        status={item?.transaction_status}
        hideBorder
      />

      <div className={cn(['mt-4 pl-[1.375rem] pr-10', inModal ? '' : 'pb-8'])}>
        <p className="text-2xl leading-7 pl-4 text-[#F5C98D]">{item?.token_metadata?.name || '--'}</p>

        <Tooltip content={<div className="max-w-[25rem]">{item?.token_metadata?.description || '--'}</div>}>
          <p className={cn(['text-sm text-[#999999] mt-6 pl-4', inModal ? 'line-clamp-3' : 'line-clamp-4'])}>
            {item?.token_metadata?.description || '--'}
          </p>
        </Tooltip>

        <div className="text-sm mt-7 flex justify-between items-center pl-4">
          <div>{item?.confirmed_time ? dayjs(item?.confirmed_time).format('YYYY-MM-DD HH:mm:ss') : '--'} Obtained</div>
        </div>

        <div className="mt-9 flex justify-between items-center gap-x-4">
          <LGButton
            className="!p-0 bg-transparent !bg-[url('https://d3dhz6pjw7pz9d.cloudfront.net/astrark/assets/bg_btn_display.png')] rounded-none bg-contain bg-no-repeat w-[12.875rem] h-20 !text-[#5D3C13] !border-none data-[disabled=true]:grayscale font-fzdb text-2xl leading-none"
            label={isDisplayed ? 'Remove' : 'Display'}
            actived
            disabled={!item || isDisplayed === undefined || disabled}
            loading={loading}
            onClick={onDisplayClick}
          />

          <LGButton
            className="!p-0 bg-transparent !bg-[url('https://d3dhz6pjw7pz9d.cloudfront.net/astrark/assets/bg_btn_use_now.png')] rounded-none bg-contain bg-no-repeat w-[12.875rem] h-20 border-none !text-white font-fzdb text-2xl leading-none"
            label="Use Now"
            disabled={!item?.expolorer_url}
            link={item?.expolorer_url}
          />
        </div>
      </div>
    </div>
  );
};

export default AssetCard;
