import { type MyTokensRecord } from '@/http/services/profile';

export default function useClaimToken() {
  async function onClaim(item: MyTokensRecord) {
    // TODO token领取逻辑
    // 1. 根据 item.reward_id 获取permit
    // 2. 调用abi方法
    // 3. 回传transaction hash
  }

  return { onClaim };
}
