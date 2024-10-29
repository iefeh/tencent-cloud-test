import { FC, useState } from 'react';
import RegularTasksList from './RegularTasksList';
import { TaskCategory } from '@/http/services/battlepass';

const MultiPoolContent: FC = () => {
  const [currentCategory, setCurrentCategory] = useState<TaskCategory>({
    id: 'multi418-449b-49c3-bf98-e56d37a648f5',
    name: 'Multi Pool',
    quest_count: 0,
    achieve_count: 0,
    image_url: '',
  });

  return <RegularTasksList categoryItem={currentCategory} hideHeader />;
};

export default MultiPoolContent;
