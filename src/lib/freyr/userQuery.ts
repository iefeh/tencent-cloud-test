import UserGoogle from '@/lib/models/UserGoogle';
import UserApple from '@/lib/models/UserApple';
import UserTwitter from '@/lib/models/UserTwitter';
import UserDiscord from '@/lib/models/UserDiscord';
import UserWallet from '@/lib/models/UserWallet';
import User from '@/lib/models/User';
import axios from 'axios';
const { parse } = require('csv-parse/sync');
import * as response from '@/lib/response/response';

export async function queryUserId(email: string, twitter: string, discord: string, address: string) {
  try {
    // Find by email
    if (!!email && email !== '') {
      const user = await User.findOne({ email: email, deleted_time: null });
      if (!!user) {
        return user.user_id;
      }

      // Email might occur in Google
      const userGoogle = await UserGoogle.findOne({ email: email, deleted_time: null });
      if (!!userGoogle) {
        return userGoogle.user_id;
      }

      // Email might occur in Apple
      const userApple = await UserApple.findOne({ apple_id: email, deleted_time: null });
      if (!!userApple) {
        return userApple.user_id;
      }
    }

    // If has twitter id, query user by twitter
    if (!!twitter && twitter !== '') {
      const userTwitter = await UserTwitter.findOne({ twitter_id: twitter, deleted_time: null });
      if (!!userTwitter) {
        return userTwitter.user_id;
      }
    }

    // If has discord id, query user by discord
    if (!!discord && discord !== '') {
      const userDiscord = await UserDiscord.findOne({ discord_id: discord, deleted_time: null });
      if (!!userDiscord) {
        return userDiscord.user_id;
      }
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

export async function checkUserQuestFromThinkingData(sql: string): Promise<any> {
  const serverURL = 'http://13.212.32.231:8992/querySql';
  // 创建查询参数
  const params = new URLSearchParams({
    token: process.env.THINKINGDATA_API_TOKEN!,
    format: 'csv_header',
    timeoutSeconds: '15',
    sql: sql,
  });

  try {
    // 发送POST请求
    const response = await axios.post(`${serverURL}?${params.toString()}`, null, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // 读取响应
    const body = response.data;
    if (body && !body.includes('_col0')) {
      console.error('Error:', body);
      return false;
    }
    // 解析CSV响应
    const records = parse(body, {
      skip_empty_lines: true,
    });

    return records;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

interface APIResponse {
  code: number;
  message: string;
}

export function convertErrorResponse(response: response.ResponseData<any>): APIResponse {
  return {
    code: response.code,
    message: response.msg,
  };
}
