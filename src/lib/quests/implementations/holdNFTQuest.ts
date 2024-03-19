import ContractNFT from '@/lib/models/ContractNFT';
import UserWallet from '@/lib/models/UserWallet';
import { QuestBase } from '@/lib/quests/implementations/base';
import { IQuest } from '@/lib/models/Quest';
import { AuthorizationType } from '@/lib/authorization/types';
import { checkClaimableResult, claimRewardResult, HoldNFT } from '@/lib/quests/types';
import logger from '@/lib/logger/winstonLogger';
import UserMetrics, { Metric } from '@/lib/models/UserMetrics';
import { sendBadgeCheckMessages } from '@/lib/kafka/client';
import { ClientSession } from 'mongoose';

export class HoldNFTQuest extends QuestBase {
  // 用户的授权钱包地址，在checkClaimable()时设置
  private user_wallet_addr = '';

  constructor(quest: IQuest) {
    super(quest);
  }

  async checkClaimable(userId: string): Promise<checkClaimableResult> {
    const questProp = this.quest.properties as HoldNFT;
    const userWallet = await UserWallet.findOne({ user_id: userId, deleted_time: null });
    if (!userWallet) {
      return {
        claimable: false,
        require_authorization: AuthorizationType.Wallet,
        tip: 'You should connect your Wallet Address first.',
      };
    }
    this.user_wallet_addr = userWallet?.wallet_addr;
    const userNft = await ContractNFT.findOne({
      chain_id: questProp.chain_id,
      contract_address: questProp.contract_addr,
      wallet_addr: this.user_wallet_addr,
      transaction_status: 'confirmed',
    });
    return {
      claimable: !!userNft,
      tip: userNft ? undefined : 'No NFT detected or NFT transaction is pending.',
    };
  }

  async addUserAchievement<T>(userId: string, verified: boolean, extraTxOps: (session: any) => Promise<T> = () => Promise.resolve(<T>{})): Promise<void> {
    const updateMetric = this.checkUserMetric(userId);
    super.addUserAchievement(userId, verified, updateMetric);
    if (updateMetric) {
      //发送该徽章检查消息.同时检查这两个指标，判断是否符合下发徽章的条件，指标值不会发送到后台进行检查。
      sendBadgeCheckMessages(userId, { [Metric.TetraHolder]: 1, [Metric.WalletNftUsdValue]: 1 });
    }
  }

  private checkUserMetric(userId: string): undefined | ((session: ClientSession) => Promise<void>) {
    const NFTProp = this.quest.properties as HoldNFT;
    const chain_id = NFTProp.chain_id;
    const contract_addr = NFTProp.contract_addr;
    let hold_nft: Number = 0;

    if (process.env.LVL1_TETRA_CHAINID === chain_id && process.env.LVL1_TETRACONTRACTADDRESS === contract_addr) {
      hold_nft = 1;
    } else if (process.env.LVL2_TETRA_CHAINID === chain_id && process.env.LVL2_TETRACONTRACTADDRESS === contract_addr) {
      hold_nft = 2;
    } else if (process.env.LVL3_TETRA_CHAINID === chain_id && process.env.LVL3_TETRACONTRACTADDRESS === contract_addr) {
      hold_nft = 3;
    }
    // 创建指标更新函数
    if (hold_nft == 0) {
      return undefined;
    }
    return async (session) => {
      await UserMetrics.updateOne(
        { user_id: userId },
        {
          $set: { tetra_holder: hold_nft },
          $setOnInsert: {
            created_time: Date.now(),
          },
        },
        { upsert: true, session: session },
      );
    };
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
    // 污染用户的白名单，确保单个白名单只能获取一次奖励
    //Tetra环境变量配置
    // 按 任务/钱包 进行污染，防止同一个钱包多次获得该任务奖励
    const taint = `${this.quest.id},${AuthorizationType.Wallet},${this.user_wallet_addr}`;
    const rewardDelta = await this.checkUserRewardDelta(userId);
    if (!rewardDelta) {
      logger.warn(`user ${userId} quest ${this.quest.id} reward amount zero`);
      return {
        verified: false,
        tip: 'Server Internal Error',
      };
    }
    //将NULL改为更新指标函数，可参考retweetTweetQuest 149
    const updateNFTHolber = this.checkUserMetric(userId);
    const result = await this.saveUserReward(userId, taint, rewardDelta, null, updateNFTHolber);
    if (result.duplicated) {
      return {
        verified: false,
        tip: 'The Wallet Address has already claimed reward.',
      };
    }
    if (updateNFTHolber) {
      //发送该徽章检查消息.同时检查这两个指标，判断是否符合下发徽章的条件，指标值不会发送到后台进行检查。
      sendBadgeCheckMessages(userId, { [Metric.TetraHolder]: 1, [Metric.WalletNftUsdValue]: 1 });
    }
    return {
      verified: result.done,
      claimed_amount: result.done ? rewardDelta : undefined,
      tip: result.done ? `You have claimed ${rewardDelta} MB.` : 'Server Internal Error',
    };
  }
}
