
import UserWallet from '@/lib/models/UserWallet';
import { QuestBase } from '@/lib/quests/implementations/base';
import { IQuest } from '@/lib/models/Quest';
import { AuthorizationType } from '@/lib/authorization/types';
import { ClaimFreeTicket, checkClaimableResult, claimRewardResult, HoldNFT } from '@/lib/quests/types';
import { redis } from '@/lib/redis/client';
import { getTokenTransactionReceiptByHash } from '@/pages/api/oauth2/minigame/ticket/paid';
import { ethers } from 'ethers';
import { getRepeatPeriodIdentifier } from '@/lib/common/timeUtils';
import QuestAchievement from '@/lib/models/QuestAchievement';
import logger from '@/lib/logger/winstonLogger';
import MiniGameDetail from '@/lib/models/MiniGameDetail';
import GameTicket from '@/lib/models/GameTicket';

export class ClaimFreeTicketQuest extends QuestBase {

  constructor(quest: IQuest) {
    super(quest);
  }

  async checkClaimable(userId: string): Promise<checkClaimableResult> {
    const questProp = this.quest.properties as ClaimFreeTicket;
    const userWallet = await UserWallet.findOne({ user_id: userId, deleted_time: null });
    if (!userWallet) {
      return {
        claimable: false,
        require_authorization: AuthorizationType.Wallet,
        tip: 'You should connect your Wallet Address first.',
      };
    }

    let achievedQuestId = this.quest.id;
    if (questProp.repeat_identifier) {
      const identifier = getRepeatPeriodIdentifier(questProp.repeat_identifier);
      achievedQuestId = `${achievedQuestId},${identifier}`
    }
    // 检查是否已完成
    const achievement = await QuestAchievement.findOne({ user_id: userId, quest_id: achievedQuestId });
    if (achievement) {
      return {
        claimable: false,
        tip: 'You have completed this quest.',
      };
    }

    const txHashCachedKey = `tx_hash_cached_key:${userId},${this.quest.id}`
    const txHash = await redis.get(txHashCachedKey);
    if (!txHash) {
      return {
        claimable: false,
        tip: 'Please provide the transaction hash.',
      };
    }

    let receipt = await getTokenTransactionReceiptByHash(process.env.CLAIM_FREE_TICKET_CHAIN!, txHash, 30, 1000)

    if (!receipt || receipt.status !== 1) {
      return {
        claimable: false,
        tip: `The transaction hash is incorrect.`,
      };
    }

    // 使用事件签名的哈希值来过滤日志
    const eventSignature = ethers.id("ClaimFreeTicket(bytes32,address)");
    const ticketContractAddress = process.env.CLAIM_FREE_TICKET_CONTRACT_ADDRESS!;
    let logs: ethers.Log[] = receipt.logs.filter(log => log.address.toLowerCase() === ticketContractAddress.toLowerCase() && log.topics[0] === eventSignature);
    if (logs.length === 0) {
      return {
        claimable: false,
        tip: `The transaction hash is incorrect.`,
      };
    }

    let ticketAbi = ["event ClaimFreeTicket(bytes32 indexed questId, address indexed player)"];
    let ticketInterface: ethers.Interface = new ethers.Interface(ticketAbi);
    let log = ticketInterface.parseLog(logs[0]);
    if (!log) {
      return {
        claimable: false,
        tip: `The transaction hash has no log.`,
      };
    }

    const questIdHash = log.args[0];
    const userAddr = ethers.getAddress(log.args[1]).toLowerCase();
    const claimable = questIdHash == this.quest.quest_id_hash && userAddr == userWallet.wallet_addr;

    return {
      claimable: claimable,
      tip: claimable ? undefined : `The transaction hash does not match the user.`,
    };
  }

  async addUserAchievement<T>(userId: string, verified: boolean, extraTxOps: (session: any) => Promise<T> = () => Promise.resolve(<T>{})): Promise<void> {
    const questProp = this.quest.properties as ClaimFreeTicket;
    if (questProp.repeat_identifier) {
      const identifier = getRepeatPeriodIdentifier(questProp.repeat_identifier);
      this.quest.id = `${this.quest.id},${identifier}`;// 将标识符添加到ID中
    }

    await super.addUserAchievement(userId, verified);
  }

  async claimReward(userId: string): Promise<claimRewardResult> {
    // 检查用户资格
    const claimableResult = await this.checkClaimable(userId);
    if (!claimableResult.claimable) {
      return {
        verified: false,
        require_authorization: claimableResult.require_authorization,
        tip: claimableResult.tip,
      };
    }


    const questProp = this.quest.properties as ClaimFreeTicket;
    let achievedQuestId = this.quest.id;
    if (questProp.repeat_identifier) {
      const identifier = getRepeatPeriodIdentifier(questProp.repeat_identifier);
      achievedQuestId = `${achievedQuestId},${identifier}`;
    }
    const taint = `${userId},${achievedQuestId}`;
    const rewardDelta = await this.checkUserRewardDelta(userId);
    if (!rewardDelta) {
      logger.warn(`user ${userId} quest ${this.quest.id} reward amount zero`);
      return {
        verified: false,
        tip: 'Server Internal Error',
      };
    }

    // 生成门票
    const detail = await MiniGameDetail.findOne({ client_id: questProp.game_id });
    let tickets: any[] = [];
    for (let i = 0; i < (questProp.ticket_amount ? questProp.ticket_amount : 1); i++) {
      const ticket = new GameTicket();
      ticket.pass_id = ethers.id(`${userId}-${achievedQuestId}-${i}`);
      ticket.pass_id = `QUEST-${ticket.pass_id}`;
      ticket.user_id = userId;
      ticket.game_id = questProp.game_id;
      ticket.created_at = Date.now();
      ticket.expired_at = detail.ticket_expired_at;
      tickets.push(ticket);
    }

    const result = await this.saveUserReward(userId, taint, rewardDelta, null, async (session) => {
      try {
        await GameTicket.insertMany(tickets, { session: session });
      } catch (error: any) {
        if (error.code !== 11000) {
          logger.warn(error);
          throw error;
        }
      }
    });
    
    if (result.duplicated) {
      return {
        verified: false,
        tip: 'You have completed this quest.',
      };
    }
    return {
      verified: result.done,
      claimed_amount: result.done ? rewardDelta : undefined,
      tip: result.done ? result.tip ? result.tip : `You have claimed ${rewardDelta} MB.` : result.tip ? result.tip : 'Server Internal Error',
    };
  }
}
