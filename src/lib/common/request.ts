import axios, {AxiosResponse} from 'axios';
import {HttpsProxyAgent} from 'https-proxy-agent';

const proxyAgent = new HttpsProxyAgent(process.env.HTTPS_PROXY_URL!);

export async function HttpsProxyGet(url: string): Promise<AxiosResponse> {
    return await axios.get(url, {
        httpsAgent: proxyAgent,
    });
}