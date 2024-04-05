import { FC } from 'react';
import Ladder from '../../Ladder';
import FinalReward from '../../FinalReward';

const RocketScreen: FC = () => {
  return (
    <div className="oppo-box w-full relative z-10 flex flex-col justify-center items-center my-60">
      <FinalReward className="mb-16" />

      <Ladder />
    </div>
  );
};

export default RocketScreen;
