import { LotteryBorders, RewardQuality } from '@/constant/lottery';
import { CSSProperties, FC } from 'react';

interface Props extends ClassNameProps {
  text: string;
  quality?: RewardQuality;
}

const RewardText: FC<Props> = ({ className, text, quality = RewardQuality.COPPERY }) => {
  function calcTextStyle(val: RewardQuality) {
    const res: CSSProperties = {};
    const color = LotteryBorders[val]?.color;
    if (!color) return res;

    switch (val) {
      case RewardQuality.GOLDEN:
        res.backgroundImage = color;
        res.backgroundClip = 'text';
        res.color = 'transparent';
        break;
      default:
        res.color = color;
        break;
    }

    return res;
  }

  const style = calcTextStyle(quality);

  return (
    <div className={className} style={style}>
      {text}
    </div>
  );
};

export default RewardText;
