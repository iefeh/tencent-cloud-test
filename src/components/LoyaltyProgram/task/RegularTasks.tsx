import { FC, useEffect, useState } from 'react';
import RegularTaskCategories from './RegularTaskCategories';
import { TaskCategory } from '@/http/services/battlepass';
import RegularTasksList from './RegularTasksList';

interface Props {
  defaultCategory?: Partial<TaskCategory> | null;
}

const RegularTasks: FC<Props> = ({ defaultCategory = null }) => {
  const [tasksVisible, setTasksVisible] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<TaskCategory> | null>(null);

  function onCategoryClick(item: TaskCategory) {
    if (item.quest_count < 1) return;

    setCurrentCategory(item);
    setTasksVisible(true);
  }

  function onBack() {
    setTasksVisible(false);
    setCurrentCategory(null);
  }

  useEffect(() => {
    setCurrentCategory(defaultCategory);
    setTasksVisible(!!defaultCategory);
  }, [defaultCategory]);

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
