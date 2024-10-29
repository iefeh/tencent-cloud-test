import { FC, useState } from 'react';
import RegularTasksList from './RegularTasksList';
import { TaskCategory } from '@/http/services/battlepass';

const PhasePoolContent: FC = () => {
  const [currentCategory, setCurrentCategory] = useState<TaskCategory>({
    id: 'phase9b3-d40b-41d5-872b-d26890188d1b',
    name: '50K POOL #1',
    quest_count: 0,
    achieve_count: 0,
    image_url: '',
  });

  return <RegularTasksList categoryItem={currentCategory} hideHeader />;
};

export default PhasePoolContent;
