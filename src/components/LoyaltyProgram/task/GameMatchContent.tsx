import { FC, useState } from 'react';
import RegularTasksList from './RegularTasksList';
import { TaskCategory } from '@/http/services/battlepass';

const GameMatchContent: FC = () => {
  const [currentCategory, setCurrentCategory] = useState<TaskCategory>({
    id: 'bubble-2826-48a4-8e6f-488d38b2b467',
    name: 'Puffy Match',
    quest_count: 0,
    achieve_count: 0,
    image_url: '',
  });

  return <RegularTasksList categoryItem={currentCategory} hideHeader />;
};

export default GameMatchContent;
