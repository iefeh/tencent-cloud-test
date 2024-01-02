import {NextApiResponse} from "next";
import {AuthorizationFlow, AuthorizationPayload} from "@/lib/models/authentication";
import getMongoConnection, {isDuplicateKeyError} from "@/lib/mongodb/client";
import {appendQueryParamsToUrl, appendResponseToUrlQueryParams} from "@/lib/utils/url";
import * as response from "@/lib/response/response";
import {generateUserSession} from "@/lib/middleware/session";
import {genLoginJWT} from "@/lib/particle.network/auth";
import logger from "@/lib/logger/winstonLogger";
import doTransaction from "@/lib/mongodb/transaction";

export interface ValidationResult {
    passed: boolean,
    authPayload?: AuthorizationPayload
}

export abstract class AuthFlowBase {
    // 校验回调的state
    abstract validateCallbackState(req: any, res: NextApiResponse): Promise<ValidationResult>;

    // 获取授权的第三方用户
    abstract getAuthParty(req: any, authPayload: AuthorizationPayload): Promise<any>;

    // 从数据库中查找第三方绑定的用户
    abstract queryUserConnectionFromParty(authParty: any): Promise<any>;

    // 构建用户绑定
    abstract constructUserConnection(userId: string, authParty: any): any;

    // 构建新用户
    abstract constructNewUser(authParty: any): any;
}

export async function handleAuthCallback(authFlow: AuthFlowBase, req: any, res: any) {
    // 检查当前的回调state，获取state对应的授权负载
    const {passed, authPayload} = await authFlow.validateCallbackState(req, res);
    if (!passed) {
        return;
    }
    if (!authPayload) {
        logger.error(`authPayload not present when validate callback passed from flow:${authFlow}`);
        res.status(500).json(response.serverError());
        return;
    }
    try {
        await getMongoConnection();
        // 获取当前的授权第三方用户
        const authParty = await authFlow.getAuthParty(req, authPayload);
        if (authPayload.flow == AuthorizationFlow.CONNECT) {
            // 执行用户绑定流程，要求第三方未绑定至任何用户
            await handleUserConnectFlow(authFlow, authPayload, authParty, res);
            return;
        }
        // 默认当前是登录流程，如果用户不存在，则需要创建新的用户与用户绑定
        await handleUserLoginFlow(authFlow, authPayload, authParty, res);
    } catch (e) {
        console.error(e);
        const landing_url = appendResponseToUrlQueryParams(authPayload.landing_url, response.serverError());
        res.redirect(landing_url);
    }
}

async function handleUserConnectFlow(authFlow: AuthFlowBase, authPayload: AuthorizationPayload, authParty: any, res: any): Promise<void> {
    const userConnection = await authFlow.queryUserConnectionFromParty(authParty);
    if (userConnection && userConnection.user_id != authPayload.authorization_user_id) {
        // 账号已经绑定到其他用户
        const landing_url = appendResponseToUrlQueryParams(authPayload.landing_url, response.accountDuplicateBound());
        res.redirect(landing_url);
        return;
    }
    // 创建新的用户绑定
    const newUserConnection = authFlow.constructUserConnection(authPayload.authorization_user_id!, authParty);
    try {
        await doTransaction(async (session) => {
            const opts = {session};
            if (userConnection) {
                // 移除历史绑定
                userConnection.deleted_time = newUserConnection.created_time
                await userConnection.save(opts);
            }
            await newUserConnection.save(opts);
        });
        const landing_url = appendResponseToUrlQueryParams(authPayload.landing_url, response.success());
        res.redirect(landing_url);
    } catch (error: any) {
        if (isDuplicateKeyError(error)) {
            logger.warn('唯一性键冲突：', error);
            const landing_url = appendResponseToUrlQueryParams(authPayload.landing_url, response.accountDuplicateBound());
            res.redirect(landing_url);
            return;
        }
        logger.error(error);
        const landing_url = appendResponseToUrlQueryParams(authPayload.landing_url, response.serverError());
        res.redirect(landing_url);
    }
}

async function handleUserLoginFlow(authFlow: AuthFlowBase, authPayload: AuthorizationPayload, authParty: any, res: any): Promise<void> {
    // 默认当前是登录流程，如果用户不存在，则需要创建新的用户与用户绑定
    let userConnection = await authFlow.queryUserConnectionFromParty(authParty);
    const isNewUser = !userConnection;
    if (isNewUser) {
        // 新创建用户与其社交绑定
        const newUser = authFlow.constructNewUser(authParty);
        userConnection = authFlow.constructUserConnection(newUser.user_id, authParty);
        await doTransaction(async (session) => {
            const opts = {session};
            await userConnection.save(opts);
            await newUser.save(opts);
        });
    }
    // 执行用户登录
    const userId = userConnection.user_id;
    const token = await generateUserSession(userId);
    const loginSuccess = response.success();
    const landing_url = appendQueryParamsToUrl(authPayload.landing_url, {
        code: loginSuccess.code,
        msg: loginSuccess.msg,
        token: token,
        particle_jwt: genLoginJWT(userId),
        is_new_user: isNewUser,
    });
    res.redirect(landing_url);
}