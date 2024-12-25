import { FullEventItem, TaskListItem } from '@/http/services/task';
import { useEffect, useState } from 'react';
import { EventStatus, QuestType } from '@/constant/task';
import { observer } from 'mobx-react-lite';
import EventTask from './EventTask';

interface VerifyTexts {
  label: string;
  finishedLable: string;
}

interface TaskItem extends TaskListItem {
  connectTexts?: VerifyTexts;
  showConnectButton?: boolean;
  showVerifyButton?: boolean;
  onConnectClick?: (type: QuestType) => string | undefined | Promise<string | undefined>;
  onVerifyClick?: (item: TaskItem) => undefined;
}

interface EventTaskProps {
  item?: FullEventItem;
  updateTasks?: () => void;
}

function EventTasks(props: EventTaskProps) {
  const { item, updateTasks } = props;
  const isInProcessing = item?.status === EventStatus.ONGOING;
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  function handleQuests(list: TaskItem[]) {
    list.forEach((item) => {
      switch (item.type) {
        case QuestType.RetweetTweet:
          item.connectTexts = {
            label: 'Repost',
            finishedLable: 'Reposted',
          };
          break;
        case QuestType.JOIN_DISCORD_SERVER:
        case QuestType.HoldDiscordRole:
        case QuestType.Claim2048Ticket:
          item.connectTexts = {
            label: 'Join',
            finishedLable: 'Joined',
          };
          break;
        case QuestType.FollowOnTwitter:
          item.connectTexts = {
            label: 'Follow',
            finishedLable: 'Followed',
          };
          break;
        case QuestType.CommentTweet:
          item.connectTexts = {
            label: 'Comment',
            finishedLable: 'Commented',
          };
          break;
        case QuestType.ViewWebsite:
          item.connectTexts = {
            label: 'Visit',
            finishedLable: 'Visited',
          };
          break;
      }
    });

    setTasks(list);
  }

  useEffect(() => {
    handleQuests(item?.tasks || []);
  }, [item]);

  const finishedCount = (item?.tasks || []).reduce((p, c) => (p += c.verified ? 1 : 0), 0);

  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="font-semakin text-2xl">Tasks</div>

        <div className="font-poppins-medium text-sm text-[#666]">
          ({finishedCount}/{item?.tasks?.length || 0}) Completed
        </div>
      </div>

      {tasks.map((task, index) => (
        <EventTask
          key={`${task.id}_${task.achieved}`}
          task={task}
          item={item!}
          isInProcessing={isInProcessing}
          updateTasks={updateTasks}
        />
      ))}
    </div>
  );
}

export default observer(EventTasks);
