import { FC, ForwardRefRenderFunction, forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import BadgeDesc from '../BadgeDesc';
import LotteryRules from '../LotteryRules';
import BadgeMilestone from '../BadgeMilestone';
import { Lottery } from '@/types/lottery';
import { queryDrawMilestoneAPI } from '@/http/services/lottery';
import { useUserContext } from '@/store/User';
import { observer } from 'mobx-react-lite';

const BadgeScreen: ForwardRefRenderFunction<UpdateForwardRenderFunction, BasePage> = ({}, ref) => {
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
    <div className="relative w-screen flex flex-col items-center pt-16 mt-10">
      <BadgeDesc milestone={milestone} />

      <BadgeMilestone className="mt-[12.75rem] mb-[4.875rem]" milestone={milestone} onUpdate={queryDrawMilestone} />

      <LotteryRules milestone={milestone} />
    </div>
  );
};

export default observer(forwardRef(BadgeScreen));
