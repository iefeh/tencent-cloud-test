import { FullEventItem } from '@/http/services/task';
import { TaskItem } from '@/types/quest';

export default function useTasksFinishInfo(item?: FullEventItem, tasks: TaskItem[] = item?.tasks || []) {
  const compulsoryTasks = tasks.filter((task) => !task.finish_type);
  const alternativeTasks = tasks.filter((task) => task.finish_type === 'least');
  const { finish_config: { complete_at_least = 0 } = {} } = item || {};

  const compulsoryFinishedCount = compulsoryTasks.reduce((p, c) => p + (c.verified ? 1 : 0), 0);
  const alternativeActualFinishedCount = alternativeTasks.reduce((p, c) => p + (c.verified ? 1 : 0), 0);
  const alternativeFinishedCount = Math.min(alternativeActualFinishedCount, complete_at_least);

  const totalFinished = compulsoryFinishedCount + alternativeFinishedCount;
  const totalMustFinishCount = compulsoryTasks.length + complete_at_least;

  return {
    compulsoryTasks,
    alternativeTasks,
    totalFinished,
    totalMustFinishCount,
    alternativeFinishedCount,
    alternativeMustFinishCount: complete_at_least,
  };
}
