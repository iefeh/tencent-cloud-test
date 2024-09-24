import { FC, useState } from 'react';
import RegularTasksList from './RegularTasksList';
import { TaskCategory } from '@/http/services/battlepass';

const GameMinerContent: FC = () => {
  const [currentCategory, setCurrentCategory] = useState<TaskCategory>({
    id: 'fbbdb5d8-59c5-4c9d-8cd5-02210b061ebb',
    name: 'Puffy Miner',
    quest_count: 0,
    achieve_count: 0,
    image_url: '',
  });

  return <RegularTasksList categoryItem={currentCategory} hideHeader />;
};

export default GameMinerContent;
