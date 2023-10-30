import * as jwt from "jsonwebtoken";
import axios from "axios";

// 生成用户JWT数据，以用于登录particle网络
export const genLoginJWT = (userId: string) => {
    const bf = Buffer.from(process.env.AUTH_ENCRYPTION_KEY_BASE64!, 'base64');
    return jwt.sign({user_id: userId}, bf, {
        algorithm: 'RS256',
        expiresIn: 60 * 3,
    });
}

type Wallet = {
    chain: "evm_chain" | "solana";
    publicAddress: string;
};

// 仅记录重要的几项属性，详情见https://docs.particle.network/developers/auth-service/sdks/server-api
type ParticleUser = {
    uuid: string;
    jwtId: string;
    wallets: Wallet[];
};

export function getEvmWallet(wallets: Wallet[]): string | null {
    // Find a wallet where chain equals "evm_chain"
    const evmWallet = wallets.find(wallet => wallet.chain === "evm_chain");

    // If found, return its publicAddress. Otherwise, return null.
    return evmWallet ? evmWallet.publicAddress : null;
}

// 获取particle网络登录的用户
export const getParticleUser = async (particleUserId: string, particleAuthToken: string): Promise<ParticleUser> => {
    const response = await axios.post<{
        jsonrpc: string;
        id: number;
        result: ParticleUser;
    }>(
        "https://api.particle.network/server/rpc",
        {
            jsonrpc: "2.0",
            id: 0,
            method: "getUserInfo",
            params: [particleUserId, particleAuthToken],
        },
        {
            auth: {
                username: process.env.PARTICLE_PROJECT_ID!,
                password: process.env.PARTICLE_PROJECT_SERVER_KEY!,
            },
        }
    );
    return response.data.result;
}