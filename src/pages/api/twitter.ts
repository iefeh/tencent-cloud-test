// pages/api/twitter.ts

import axios from 'axios';
import qs from 'querystring';
import crypto from "crypto";

export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    try {
      const { origin } = req.body; // 从请求体中获取 origin 参数

      const oauthHeader: any = {
        oauth_callback: origin, // 替换为你的回调URL
        oauth_consumer_key: '8GVz2KC81Psf63801UjlWFy0J',
        oauth_nonce: generateNonce(),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(Date.now() / 1000),
        oauth_version: '1.0',
      };
      
      const signature = generateSignature('POST', 'https://api.twitter.com/oauth/request_token', oauthHeader);

      oauthHeader.oauth_signature = signature;

      const response = await axios.post('https://api.twitter.com/oauth/request_token', null, {
        headers: {
          'Authorization': generateAuthorizationHeader(oauthHeader),
        },
      });

      const data = qs.parse(response.data);

      if (data.oauth_callback_confirmed) {
        const redirectUrl = `https://api.twitter.com/oauth/authenticate?oauth_token=${data.oauth_token}`;
        res.redirect(redirectUrl);
      } else {
        console.error('Twitter request token response error:', data);
        res.status(500).json({ error: 'Error requesting Twitter request token' });
      }
    } catch (error) {
      console.error('Twitter request token error:', error);
      res.status(500).json({ error: 'Error requesting Twitter request token' });
    }
  } else {
    res.status(405).end();
  }
};

// 添加生成签名、生成随机数等辅助函数
// 生成随机字符串（用于生成nonce）
function generateNonce() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let nonce = '';

  for (let i = 0; i < 32; i++) {
    nonce += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return nonce;
}

// 生成OAuth签名
function generateSignature(httpMethod: string, url: string, oauthParams: any) {
  const baseString = generateBaseString(httpMethod, url, oauthParams);
  const signingKey = `${encodeURIComponent('diF9FNT8RrafGo4c9Q6gAHFdEXdo28QmlNYQJzLu8w6zLRx4PJ')}&`; // 替换为你的Twitter API Secret Key
  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(baseString)
    .digest('base64');
  return signature;
}

// 生成OAuth基本字符串
function generateBaseString(httpMethod: string, url: string, oauthParams: any) {
  const encodedParams = Object.entries(oauthParams)
    .map(([key, value]: any) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return `${httpMethod.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(encodedParams)}`;
}

// 生成OAuth授权头
function generateAuthorizationHeader(oauthParams: any) {
  const headerParams = Object.entries(oauthParams)
    .map(([key, value]: any) => `${encodeURIComponent(key)}="${encodeURIComponent(value)}"`)
    .join(', ');
  return `OAuth ${headerParams}`;
}


