import UserWallet from "@/lib/models/UserWallet";
import {IQuest} from "@/lib/models/Quest";
import {verifyQuestResult} from "@/lib/quests/types";

export async function queryUserWalletAuthorization(userId: string): Promise<any> {
    return await UserWallet.findOne({user_id: userId, deleted_time: null});
}

// 校验用户是否绑定了钱包
export async function verifyConnectWalletQuest(userId: string, quest: IQuest): Promise<verifyQuestResult> {
    const wallet = await queryUserWalletAuthorization(userId);
    return {claimable: !!wallet, wallet: wallet};
}