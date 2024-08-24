import { FC } from 'react';
import BannerSwiper from './BannerSwiper';
import DetailsInfo from './DetailsInfo';

const OverviewTabPanel: FC = () => {
  return (
    <div className="flex md:flex-row flex-col gap-5 flex-nowrap">
      <BannerSwiper />

      <DetailsInfo />
    </div>
  );
};

export default OverviewTabPanel;
