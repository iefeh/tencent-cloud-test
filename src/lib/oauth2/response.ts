import {AccessDeniedError, OAuthError} from "@node-oauth/oauth2-server";
import logger from "@/lib/logger/winstonLogger";
import * as response from "@/lib/response/response";


export function responseOnOauthError(res: any, error: any) {
    // 判断error是否为AccessDeniedError
    if (error instanceof AccessDeniedError) {
        logger.warn(error);
        return res.json(response.unauthorized({message: error.message}));
    }
    // 亦或者判断error是否为OAuthError
    if (error instanceof OAuthError) {
        logger.warn(error);
        return res.json(response.invalidParams({message: error.message}));
    }
    logger.error(error);
    return res.status(500).json(response.serverError());
}