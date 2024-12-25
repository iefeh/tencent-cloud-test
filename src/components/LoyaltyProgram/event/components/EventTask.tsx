import { TaskItem } from '@/types/quest';
import { QuestType } from '@/constant/task';
import S3Image from '@/components/common/medias/S3Image';
import EventTaskCountDown from './EventTaskCountDown';
import EventTaskButtons from './EventTaskButtons';
import { FullEventItem } from '@/http/services/task';

const EVENT_ICON_DICT: Dict<string> = {
  [QuestType.ConnectWallet]: 'wallet_colored',
  [QuestType.ConnectTwitter]: 'twitter_colored',
  [QuestType.ConnectDiscord]: 'discord_colored',
  [QuestType.ConnectTelegram]: 'telegram_colored',
  [QuestType.ConnectSteam]: 'steam_colored',
  [QuestType.FollowOnTwitter]: 'twitter_colored',
  [QuestType.RetweetTweet]: 'twitter_colored',
  [QuestType.LikeTwitter]: 'twitter_colored',
  [QuestType.CommentTweet]: 'twitter_colored',
  [QuestType.JOIN_DISCORD_SERVER]: 'discord_colored',
  [QuestType.HoldDiscordRole]: 'discord_colored',
  [QuestType.SEND_DISCORD_MESSAGE]: 'discord_colored',
  [QuestType.HoldNFT]: 'nft_colored',
  [QuestType.ThinkingDataQuery]: 'https://d3dhz6pjw7pz9d.cloudfront.net/game/2048/%E5%9B%BE%E5%B1%82+47.png',
  [QuestType.Claim2048Ticket]: 'https://d3dhz6pjw7pz9d.cloudfront.net/game/2048/%E5%9B%BE%E5%B1%82+47.png',
};

const EventTask = ({
  item,
  task,
  isInProcessing,
  updateTasks,
}: {
  item: FullEventItem;
  task: TaskItem;
  isInProcessing: boolean;
  updateTasks?: () => void;
}) => {
  const { started, started_after } = task;

  function getTaskIcon() {
    const url = EVENT_ICON_DICT[task.type] || 'default_colored';
    if (url.startsWith('http')) return url;
    return `local:/img/loyalty/task/${url}.png`;
  }

  return (
    <div className="flex justify-between py-[1.375rem] pl-[1.5625rem] pr-[1.75rem] rounded-[0.625rem] border-1 border-basic-gray hover:border-[#666] bg-basic-gray [&:not(:first-child)]:mt-[0.625rem] transition-colors duration-300 flex-col lg:flex-row items-start lg:items-center">
      <div className="flex items-center">
        <S3Image className="w-9 h-9 object-contain" src={getTaskIcon()} width={36} height={36} />
        <div className="font-poppins-medium text-lg ml-[0.875rem] flex justify-between items-center">
          <div dangerouslySetInnerHTML={{ __html: task.description }}></div>

          {task.current_progress !== undefined && task.target_progress !== undefined && (
            <div className="text-base shrink-0">
              (
              <span className="text-basic-yellow">
                {task.current_progress || 0}/{task.target_progress || '-'}
              </span>
              )
            </div>
          )}
        </div>
      </div>

      {isInProcessing && (
        <div className="w-full lg:w-auto flex justify-end mt-4 lg:mt-0 ml-4 shrink-0">
          {started ? (
            <EventTaskButtons task={task} campaignId={item.id} updateTasks={updateTasks} />
          ) : (
            <EventTaskCountDown durationTime={started_after || 0} />
          )}
        </div>
      )}
    </div>
  );
};

export default EventTask;
