import UserSteam, {IUserSteam} from "@/lib/models/UserSteam";
import {IQuest} from "@/lib/models/Quest";
import {checkClaimableResult, claimRewardResult, QuestRewardType} from "@/lib/quests/types";
import {QuestBase} from "@/lib/quests/implementations/base";
import {AuthorizationType} from "@/lib/authorization/types";
import {HttpsProxyGet} from "@/lib/common/request";
import SteamGame, {SteamGameFilter, SteamGamePriceOverview} from "@/lib/models/SteamGame";
import {v4 as uuidv4} from "uuid";
import UserMetrics, {Metric} from "@/lib/models/UserMetrics";
import {chunkArray} from "@/lib/common/url";
import SteamUserGame, {ISteamUserGame} from "@/lib/models/SteamUserGame";
import logger from "@/lib/logger/winstonLogger";
import doTransaction from "@/lib/mongodb/transaction";
import { sendBadgeCheckMessages } from "@/lib/kafka/client";

export class ConnectSteamQuest extends QuestBase {
    constructor(quest: IQuest) {
        super(quest);
    }

    async checkClaimable(userId: string): Promise<checkClaimableResult> {
        const userSteam = await UserSteam.findOne({user_id: userId, deleted_time: null});
        return {
            claimable: !!userSteam,
            require_authorization: userSteam ? undefined : AuthorizationType.Steam,
        }
    }

    async claimReward(userId: string): Promise<claimRewardResult> {
        // 获取用户的steam
        const userSteam = await UserSteam.findOne({user_id: userId, deleted_time: null});
        if (!userSteam) {
            return {
                verified: false,
                require_authorization: AuthorizationType.Steam,
                tip: "You should connect your Steam Account first."
            }
        }
        const refreshResult = await this.refreshUserSteamMetric(userId, userSteam);
        if (refreshResult.interrupted) {
            return refreshResult.interrupted;
        }
        const rewardDelta = await this.checkUserRewardDelta(userId);
        // 按 任务/steam id 进行污染，防止同一个steam账号多次获得该任务奖励
        const taint = `${this.quest.id},${AuthorizationType.Steam},${userSteam.steam_id}`
        const assetId = refreshResult.userMetric[Metric.SteamAssetId];
        const result = await this.saveUserReward(userId, taint, rewardDelta, assetId);
        if (result.duplicated) {
            return {
                verified: false,
                tip: "The Steam Account has already claimed reward.",
            }
        }
        return {
            verified: result.done,
            claimed_amount: result.done ? rewardDelta : undefined,
            tip: result.done ? `You have claimed ${rewardDelta} MB.` : "Server Internal Error",
        }
    }

    // 当返回claimRewardResult时，表示刷新有问题，返回null则表示成功
    async refreshUserSteamMetric(userId: string, userSteam: IUserSteam): Promise<refreshUserSteamMetricResult> {
        // 校验用户的游戏数
        const refreshGameStats = await this.refreshUserGameStats(userId, userSteam.steam_id);
        if (refreshGameStats.interrupted) {
            return {
                interrupted: refreshGameStats.interrupted,
                userMetric: null,
            };
        }
        const userSteamGame = refreshGameStats.userSteamGame!;
        const gameCount = userSteamGame.game_count!;
        const userGames = userSteamGame.games!;
        // 保存用户的游戏信息
        const gameIds = userGames.map(game => game.appid);
        const gamePriceMap = await this.prepareUserGamePriceInfos(userSteam.steam_id, gameIds);
        // 计算用户的账号价值
        const accountYears = (Date.now() / 1000 - userSteam.timecreated) / (365 * 24 * 3600);
        let accountValue = 0;
        gamePriceMap.forEach((priceOverview, appid) => {
            if (!priceOverview) {
                return;
            }
            accountValue += (priceOverview.final / 100);
        });
        const steamRating = this.calcUserSteamRating(accountYears, gameCount, accountValue);
        // 保存用户steam游戏与指标
        const userMetric = {
            [Metric.SteamAssetId]: userSteamGame.id,
            [Metric.SteamAccountYears]: Number(accountYears.toFixed(2)),
            [Metric.SteamAccountGameCount]: gameCount,
            [Metric.SteamAccountUSDValue]: Number(accountValue.toFixed(2)),
            [Metric.SteamAccountRating]: steamRating,
        }
        await doTransaction(async (session) => {
            // 保存用户的资产凭证
            await userSteamGame.save({session});
            // 保存用户的指标信息
            await UserMetrics.updateOne(
                {user_id: userId},
                {
                    $set: userMetric,
                    $setOnInsert: {
                        "created_time": Date.now(),
                    }
                },
                {upsert: true, session: session}
            );
        });

        sendBadgeCheckMessages(userId,userMetric);

        return {
            userMetric: userMetric
        };
    }

    // 当返回claimRewardResult时，表示刷新有问题，返回null则表示成功
    async refreshUserGameStats(userId: string, steamId: string): Promise<refreshUserGameStatsResult> {
        // 校验用户的游戏数据
        const userGamesURL = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${process.env.STEAM_CLIENT_SECRET}&steamid=${steamId}&include_played_free_games=true&include_appinfo=true`
        const response = await HttpsProxyGet(userGamesURL);
        const gameCount = response.data.response.game_count;
        if (!gameCount) {
            return {
                refreshed: false,
                interrupted: {
                    verified: false,
                    tip: "No game info detected, please make sure your profile is public and there is at least 1 game on your Steam account."
                }
            }
        }
        // 用户的游戏数据
        const userSteamGame = new SteamUserGame({
            id: uuidv4(),
            user_id: userId,
            steam_id: steamId,
            game_count: gameCount,
            games: response.data.response.games,
            created_time: Date.now(),
        });
        return {
            refreshed: true,
            userSteamGame: userSteamGame,
        }
    }

    calcUserSteamRating(accountYears: number, gameCount: number, accountValue: number): number {
        let accountYearsRating = 0;
        let gameCountRating = 0;
        let accountValueRating = 0;
        // 对账户年限进行评分
        switch (true) {
            case accountYears > 10:
                accountYearsRating = 20;
                break;
            case accountYears > 7:
                accountYearsRating = 15;
                break;
            case accountYears > 5:
                accountYearsRating = 12;
                break;
            case accountYears > 3:
                accountYearsRating = 10;
                break;
            case accountYears > 1:
                accountYearsRating = 5;
                break;
            default:
                accountYearsRating = 2;
        }
        // 对游戏数进行评分
        switch (true) {
            case gameCount > 50:
                gameCountRating = 20;
                break;
            case gameCount > 40:
                gameCountRating = 15;
                break;
            case gameCount > 30:
                gameCountRating = 12;
                break;
            case gameCount > 20:
                gameCountRating = 10;
                break;
            case gameCount > 10:
                gameCountRating = 5;
                break;
            default:
                gameCountRating = 2;
        }

        // 账户价值进行评分
        switch (true) {
            case accountValue > 2000:
                accountValueRating = 60;
                break;
            case accountValue > 1000:
                accountValueRating = 40;
                break;
            case accountValue > 500:
                accountValueRating = 30;
                break;
            case accountValue > 300:
                accountValueRating = 20;
                break;
            case accountValue > 100:
                accountValueRating = 10;
                break;
            case accountValue > 1:
                accountValueRating = 5;
        }
        return accountYearsRating + gameCountRating + accountValueRating;
    }

    async prepareUserGamePriceInfos(steamId: string, gameIds: string[]): Promise<Map<String, SteamGamePriceOverview>> {
        const gameIdArray = chunkArray(gameIds, 500);
        const gamePriceMap = new Map<String, SteamGamePriceOverview>();

        for (let subGameIds of gameIdArray) {
            const subGamePriceMap = await this.prepareUserGamePriceInfoBatch(steamId, subGameIds);
            subGamePriceMap.forEach((priceOverview, appid) => {
                if (!priceOverview) {
                    return;
                }
                gamePriceMap.set(appid, priceOverview);
            });
        }
        return gamePriceMap;
    }

    async prepareUserGamePriceInfoBatch(steamId: string, gameIds: string[]): Promise<Map<String, SteamGamePriceOverview>> {
        // 已成功获取到用户的游戏数据，获取db游戏信息，以决定是否从steam拉取新的游戏信息
        const dbGames = await SteamGame.find({steam_appid: {$in: gameIds}}, {
            _id: 0,
            steam_appid: 1,
            is_free: 1,
            price_overview: 1
        });
        const gamePriceMap = new Map<String, SteamGamePriceOverview>(dbGames.map(game => [game.steam_appid, game.price_overview]));
        // 找出不在db中的游戏，并从steam查询对应的信息
        const missingGameIds = gameIds.filter(gameId => !gamePriceMap.has(gameId));
        if (!missingGameIds || missingGameIds.length == 0) {
            return gamePriceMap;
        }
        // 查询所有的app的价格信息
        const appids = missingGameIds.join(",");
        const response = await HttpsProxyGet(`https://store.steampowered.com/api/appdetails?appids=${appids}&cc=us&l=en&filters=price_overview`);
        const apps = response.data;
        const bulkOps = Object.keys(apps).map(appid => {
            gamePriceMap.set(appid, apps[appid].data?.price_overview);
            return {
                updateOne: {
                    filter: {steam_appid: appid},
                    update: {
                        $set: {
                            // 成功拿到价格信息就置为false
                            is_free: !apps[appid].success,
                            price_overview: apps[appid].data?.price_overview,
                        },
                        $setOnInsert: {
                            filter: SteamGameFilter.PriceOverview,
                            created_time: Date.now(),
                        }
                    },
                    upsert: true
                }
            };
        });
        // 保存app价格信息
        await SteamGame.bulkWrite(bulkOps);
        return gamePriceMap;
    }
}

type refreshUserGameStatsResult = {
    refreshed: boolean;
    userSteamGame?: ISteamUserGame;
    interrupted?: claimRewardResult
}

type refreshUserSteamMetricResult = {
    interrupted?: claimRewardResult;
    userMetric: any;
}

export async function queryUserSteamAuthorization(userId: string): Promise<any> {
    return await UserSteam.findOne({user_id: userId, deleted_time: null});
}

// 校验用户是否绑定了steam
export async function verifyConnectSteamQuest(userId: string, quest: IQuest): Promise<checkClaimableResult> {
    const steam = await queryUserSteamAuthorization(userId);
    return {claimable: !!steam};
}