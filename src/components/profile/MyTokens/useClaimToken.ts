import { queryTokenPermitAPI, type MyTokensRecord } from '@/http/services/token';

export default function useClaimToken() {
  async function onClaim(item: MyTokensRecord) {
    // TODO token领取逻辑
    const permitRes = await queryTokenPermitAPI({ reward_ids: item.reward_id });
    // 0. 判断用户是否已绑定钱包地址，否 -> 弹窗提示钱包没有绑定
    // 1. 根据 item.reward_id 获取permit
    // 2. 调用abi方法
    // 2.1 确认钱包环境：连接钱包、网络是否匹配
    // 2.2 通过合约地址调用合约方法
    // 3. 回传transaction hash
  }

  return { onClaim };
}
