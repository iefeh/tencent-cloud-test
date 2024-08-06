import { FC, useState } from 'react';
import RegularTaskCategories from './RegularTaskCategories';
import { TaskCategory } from '@/http/services/battlepass';
import RegularTasksList from './RegularTasksList';

const RegularTasks: FC = () => {
  const [tasksVisible, setTasksVisible] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<TaskCategory | null>(null);

  function onCategoryClick(item: TaskCategory) {
    if (item.quest_count < 1) return;

    setCurrentCategory(item);
    setTasksVisible(true);
  }

  function onBack() {
    setTasksVisible(false);
    setCurrentCategory(null);
  }

  return (
    <>
      <RegularTaskCategories
        className={tasksVisible && currentCategory ? 'hidden' : ''}
        onCategoryClick={onCategoryClick}
      />

      <RegularTasksList
        className={tasksVisible && currentCategory ? 'block' : 'hidden'}
        categoryItem={currentCategory}
        onBack={onBack}
      />
    </>
  );
};

export default RegularTasks;
