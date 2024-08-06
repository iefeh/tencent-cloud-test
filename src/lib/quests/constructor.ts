import { IQuest } from '@/lib/models/Quest';
import { QuestBase } from '@/lib/quests/implementations/base';
import { ConnectDiscordQuest } from '@/lib/quests/implementations/connectDiscordQuest';
import { ConnectSteamQuest } from '@/lib/quests/implementations/connectSteamQuest';
import { ConnectTwitterQuest } from '@/lib/quests/implementations/connectTwitterQuest';
import { ConnectTelegramQuest } from '@/lib/quests/implementations/connectTelegramQuest';
import { ConnectWalletQuest } from '@/lib/quests/implementations/connectWalletQuest';
import { FollowOnTwitterQuest } from '@/lib/quests/implementations/followOnTwitterQuest';
import { HoldDiscordRoleQuest } from '@/lib/quests/implementations/holdDiscordRoleQuest';
import { HoldNFTQuest } from '@/lib/quests/implementations/holdNFTQuest';
import { JoinDiscordServerQuest } from '@/lib/quests/implementations/joinDiscordServerQuest';
import { LikeTweetQuest } from '@/lib/quests/implementations/likeTweetQuest';
import { RetweetTweetQuest } from '@/lib/quests/implementations/retweetTweetQuest';
import { SendDiscordMessageQuest } from '@/lib/quests/implementations/sendDiscordMessageQuest';
import { UserMetricQuest } from '@/lib/quests/implementations/userMetricQuest';
import { WhitelistQuest } from '@/lib/quests/implementations/whitelistQuest';
import { QuestType } from '@/lib/quests/types';

import { Claim2048TicketQuest } from './implementations/claim2048Ticket';
import { ClaimLotteryTicketQuest } from './implementations/claimLotteryTicket';
import { CommentTweetQuest } from './implementations/commentTweetQuest';
import { FollowOnTwitterQuestNew } from './implementations/followOnTwitterQuestNew';
import { HoldBadgeSBTQuest } from './implementations/holdBadgeSBTQuest';
import { ThinkingDataQueryQuest } from './implementations/thinkingDataQueryQuest';
import { ThirdPartyCallbackQuest } from './implementations/thirdPartyCallbackQuest';
import { TweetInteractionQuest } from './implementations/tweetInteraction';
import { TwitterFollowerQuest } from './implementations/twitterFollowerQuest';
import { TwitterTopicQuest } from './implementations/twitterTopicQuest';
import { ViewWebsiteQuest } from './implementations/viewWebsite';

// 根据quest的type构造对应的quest实例
export function constructQuest(quest: IQuest): QuestBase {
    switch (quest.type) {
        case QuestType.ConnectWallet:
            return new ConnectWalletQuest(quest);
        case QuestType.ConnectDiscord:
            return new ConnectDiscordQuest(quest);
        case QuestType.FollowOnTwitter:
            return new FollowOnTwitterQuest(quest);
        case QuestType.RetweetTweet:
            return new RetweetTweetQuest(quest);
        case QuestType.LikeTweet:
            return new LikeTweetQuest(quest);
        case QuestType.CommentTweet:
            return new CommentTweetQuest(quest);
        case QuestType.ConnectTwitter:
            return new ConnectTwitterQuest(quest);
        case QuestType.ConnectSteam:
            return new ConnectSteamQuest(quest);
        case QuestType.ConnectTelegram:
            return new ConnectTelegramQuest(quest);
        case QuestType.JoinDiscordServer:
            return new JoinDiscordServerQuest(quest);
        case QuestType.HoldDiscordRole:
            return new HoldDiscordRoleQuest(quest);
        case QuestType.SendDiscordMessage:
            return new SendDiscordMessageQuest(quest);
        case QuestType.UserMetric:
            return new UserMetricQuest(quest);
        case QuestType.Whitelist:
            return new WhitelistQuest(quest);
        case QuestType.HoldNFT:
            return new HoldNFTQuest(quest);
        case QuestType.TwitterFollower:
            return new TwitterFollowerQuest(quest);
        case QuestType.TwitterTopic:
            return new TwitterTopicQuest(quest);
        case QuestType.TweetInteraction:
            return new TweetInteractionQuest(quest);
        case QuestType.HoldBadgeSBT:
            return new HoldBadgeSBTQuest(quest);
        case QuestType.ThinkingDataQuery:
            return new ThinkingDataQueryQuest(quest);
        case QuestType.Claim2048Ticket:
            return new Claim2048TicketQuest(quest);
        case QuestType.ViewWebsite:
            return new ViewWebsiteQuest(quest);
        case QuestType.ClaimLotteryTicket:
            return new ClaimLotteryTicketQuest(quest);
        case QuestType.ViewWebsite:
            return new ViewWebsiteQuest(quest);
        case QuestType.FollowOnTwitterNew:
            return new FollowOnTwitterQuestNew(quest);
        case QuestType.ThirdPartyCallback:
            return new ThirdPartyCallbackQuest(quest);
        default:
            throw new Error(`quest ${quest.id} type ${quest.type} not implemented`);
    }
}
