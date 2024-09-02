import { FC, useState } from 'react';
import RegularTasksList from './RegularTasksList';
import { TaskCategory } from '@/http/services/battlepass';

const GameMinerContent: FC = () => {
  const [currentCategory, setCurrentCategory] = useState<TaskCategory>({
    id: '1bcb51aa-bab1-476d-b09a-f20d103d16d0',
    name: 'Puffy Miner',
    quest_count: 0,
    achieve_count: 0,
    image_url: '',
  });

  return <RegularTasksList categoryItem={currentCategory} hideHeader />;
};

export default GameMinerContent;
