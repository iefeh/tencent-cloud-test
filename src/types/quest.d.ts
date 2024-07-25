import type { TaskListItem } from '@/http/services/task';

export interface TaskItem extends TaskListItem {
  connectTexts?: VerifyTexts;
  showConnectButton?: boolean;
  showVerifyButton?: boolean;
  onConnectClick?: (type: QuestType) => string | undefined | Promise<string | undefined>;
  onVerifyClick?: (item: TaskItem) => undefined;
}

export interface VerifyTexts {
  label: string;
  finishedLable: string;
}
