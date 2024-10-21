import { FC, useState } from 'react';
import RegularTasksList from './RegularTasksList';
import { TaskCategory } from '@/http/services/battlepass';

const NodeContent: FC = () => {
  const [currentCategory, setCurrentCategory] = useState<TaskCategory>({
    id: 'node0fa5-e136-4507-ad2f-2e5365c35fc7',
    name: 'Node',
    quest_count: 0,
    achieve_count: 0,
    image_url: '',
  });

  return <RegularTasksList categoryItem={currentCategory} hideHeader />;
};

export default NodeContent;
