import { Button, Tooltip } from '@nextui-org/react';
import { FC, useState } from 'react';
import WarningSVG from 'svg/warning.svg';

const TreasureBoxTooltip: FC = () => {
  const [isBoxTipsOpen, setIsBoxTipsOpen] = useState(false);

  return (
    <>
      <Tooltip
        isOpen={isBoxTipsOpen}
        onOpenChange={(isOpen) => !isOpen && setIsBoxTipsOpen(isOpen)}
        content={
          <div className="max-w-[25rem] px-2 py-1">
            Upon reaching this level, we will directly send the in-game redemption code via Moonveil website
            notification during the AstrArk Alpha Test 2.0 phase. Please check your code, and log in to the game to
            redeem for rewards. If you do not receive the reward within 48 hours of the test starting, please contact us
            via Discord Tickets.
          </div>
        }
      >
        <Button
          className="absolute top-[0.9375rem] -right-[1.5rem] p-0 min-w-0 w-auto h-auto bg-transparent"
          onClick={() => setIsBoxTipsOpen(true)}
        >
          <WarningSVG className="fill-white w-6 h-6 cursor-pointer" />
        </Button>
      </Tooltip>
    </>
  );
};

export default TreasureBoxTooltip;
