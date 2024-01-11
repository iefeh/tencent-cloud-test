import axios, {AxiosResponse} from 'axios';
import {HttpsProxyAgent} from 'https-proxy-agent';

const proxyAgent = new HttpsProxyAgent(process.env.HTTPS_PROXY_URL!);

export async function HttpsProxyGet(url: string): Promise<AxiosResponse> {
    return await axios.get(url, {
        httpsAgent: proxyAgent,
    });
}


export function getClientIP(req: any): string {
    let realIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (realIp) {
        // 可能有多个 IP 地址，取第一个
        realIp = realIp.split(',')[0];
    }
    return realIp;
}