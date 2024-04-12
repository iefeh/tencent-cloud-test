import { currentDomain } from "../common/environment";
import { createUserNotification } from "../models/UserNotifications";

// 创建赛季升级通知
export async function createSeasonPassLevelNotification(userId:string, level:number, session?:any) :Promise<void> {
    const content = `Congratulations on reaching level ${level} in the Rock’it it to the Moon Season, please go to the season page to claim your rewards.`;
    const link = `${currentDomain()}/LoyaltyProgram/season`;
    await createUserNotification(userId, content, link, session);
}