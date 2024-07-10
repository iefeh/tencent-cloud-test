import { FC, useState } from 'react';
import RegularTasksList from './RegularTasksList';
import { TaskCategory } from '@/http/services/battlepass';

const BushWhackContent: FC = () => {
  const [currentCategory, setCurrentCategory] = useState<TaskCategory>({
    id: process.env.NEXT_PUBLIC_TASK_CATEGORY_ID_BR!,
    name: 'BushWhack',
    quest_count: 0,
    achieve_count: 0,
    image_url: '',
  });

  return <RegularTasksList categoryItem={currentCategory} hideHeader />;
};

export default BushWhackContent;
