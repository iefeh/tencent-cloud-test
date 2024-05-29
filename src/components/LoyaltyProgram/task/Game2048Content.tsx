import { FC, useState } from 'react';
import RegularTasksList from './RegularTasksList';
import { TaskCategory } from '@/http/services/battlepass';

const Game2048Content: FC = () => {
  const [currentCategory, setCurrentCategory] = useState<TaskCategory>({
    id: process.env.NEXT_PUBLIC_TASK_CATEGORY_ID_2048!,
    name: '2048 Mini Game',
    quest_count: 0,
    achieve_count: 0,
    image_url: '',
  });

  return <RegularTasksList categoryItem={currentCategory} hideHeader />;
};

export default Game2048Content;
