import { ForwardRefRenderFunction, forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import LotteryRules from '../LotteryRules';
import { Lottery } from '@/types/lottery';
import { queryDrawMilestoneAPI } from '@/http/services/lottery';
import { useUserContext } from '@/store/User';
import { observer } from 'mobx-react-lite';

const RulesScreen: ForwardRefRenderFunction<UpdateForwardRenderFunction, BasePage & ItemProps<Lottery.Pool>> = (
  { item },
  ref,
) => {
  const { userInfo } = useUserContext();
  const [milestone, setMilestone] = useState<Lottery.MilestoneDTO | null>(null);

  async function queryDrawMilestone() {
    const res = await queryDrawMilestoneAPI();
    setMilestone(res || null);
  }

  useImperativeHandle(ref, () => ({
    update: queryDrawMilestone,
  }));

  useEffect(() => {
    queryDrawMilestone();
  }, [userInfo]);

  return (
    <div className="relative w-screen flex flex-col items-center pt-16">
      <LotteryRules milestone={milestone} />
    </div>
  );
};

export default observer(forwardRef(RulesScreen));
