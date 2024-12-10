import UserGoogle from '@/lib/models/UserGoogle';
import UserWallet from '@/lib/models/UserWallet';
import User from '@/lib/models/User';

export async function queryUserId(email: string, address: string) {
  try {
    // Find by email
    const user = await User.findOne({ email: email, deleted_time: null });
    if (!!user) {
      return user.user_id;
    }

    // Email might occur in Google
    const userGoogle = await UserGoogle.findOne({ email: email, deleted_time: null });
    if (!!userGoogle) {
      return userGoogle.user_id;
    }

    // If has wallet address, query user by address
    if (!!address && address !== '') {
      const userWallet = await UserWallet.findOne({ wallet_addr: address, deleted_time: null });
      if (!!userWallet) {
        return userWallet.user_id;
      }
    }

    return '';
  } catch (e) {
    throw e;
  }
}
