import {NextApiRequest, NextApiResponse} from "next";
import * as response from "@/lib/response/response";
import {redis} from "@/lib/redis/client";

// UserContextRequest 请求携带用户上下文信息
export interface UserContextRequest extends NextApiRequest {
    userId?: string;
}

// mustAuthInterceptor 强制授权拦截器，如果用户未授权则直接返回
export async function mustAuthInterceptor(req: UserContextRequest, res: NextApiResponse, next: () => void) {
    const authorization = req.headers.authorization;
    if (!authorization) {
        res.json(response.unauthorized());
        return;
    }
    const userId = await redis.get(`user_session:${authorization}`);
    if (!userId) {
        res.json(response.unauthorized());
        return;
    }

    // 将用户数据添加到请求对象中
    req.userId = userId;

    next();
}

// maybeAuthInterceptor 选择授权拦截器，如果用户有有效认证token则进行校验
export async function maybeAuthInterceptor(req: UserContextRequest, res: NextApiResponse, next: () => void) {
    const authorization = req.headers.authorization;
    if (authorization) {
        const userId = await redis.get(`user_session:${authorization}`);
        if (userId) {
            // 将用户数据添加到请求对象中
            // req.userId = userId;
            req.userId = 'f30010e1-7af4-4237-8a36-782b65aad9fb';
        }
    }
    next();
}