import {IQuest} from "@/lib/models/Quest";
import {claimRewardResult} from "@/lib/quests/types";
import {ConnectTwitterQuest} from "@/lib/quests/implementations/connectTwitterQuest";


export class FollowOnTwitterQuest extends ConnectTwitterQuest {
    constructor(quest: IQuest) {
        super(quest);
    }

    async claimReward(userId: string): Promise<claimRewardResult> {
        await promiseSleep(1200);
        return super.claimReward(userId);
    }
}