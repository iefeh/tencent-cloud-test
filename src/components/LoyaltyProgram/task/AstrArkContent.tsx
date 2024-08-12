import { FC, useState } from 'react';
import RegularTasksList from './RegularTasksList';
import { TaskCategory } from '@/http/services/battlepass';

const AstrArkContent: FC = () => {
  const [currentCategory, setCurrentCategory] = useState<TaskCategory>({
    id: process.env.NEXT_PUBLIC_TASK_CATEGORY_ID_AA!,
    name: 'AstrArk',
    quest_count: 0,
    achieve_count: 0,
    image_url: '',
  });

  return <RegularTasksList categoryItem={currentCategory} hideHeader />;
};

export default AstrArkContent;
