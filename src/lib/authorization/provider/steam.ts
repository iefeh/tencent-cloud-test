import * as response from "@/lib/response/response";
import {AuthorizationFlow, AuthorizationPayload} from "@/lib/models/authentication";
import {v4 as uuidv4} from "uuid";
import {redis} from "@/lib/redis/client";
import {AuthFlowBase, ValidationResult} from "@/lib/authorization/provider/authFlow";
import User from "@/lib/models/User";
import {appendQueryParamsToUrl} from "@/lib/utils/url";
import axios from "axios";
import logger from "@/lib/logger/winstonLogger";
import {NextApiResponse} from "next";
import {AuthorizationType} from "@/lib/authorization/types";
import {validateCallbackState} from "@/lib/authorization/provider/validator";
import * as SteamWebAPI from 'steamapi';
import UserSteam from "@/lib/models/UserSteam";

// const SteamAPI = require('steamapi');

const OPENID_CHECK = {
    ns: 'http://specs.openid.net/auth/2.0',
    claimed_id: 'https://steamcommunity.com/openid/id/',
    identity: 'https://steamcommunity.com/openid/id/',
};

export async function generateAuthorizationURL(req: any, res: any) {
    // 检查用户的授权落地页
    const landing_url = req.query.landing_url as string;
    if (!req.query.landing_url) {
        res.json(response.invalidParams());
        return;
    }

    // 生成授权的状态字段
    const currFlow = req.userId ? AuthorizationFlow.CONNECT : AuthorizationFlow.LOGIN;
    const payload: AuthorizationPayload = {
        landing_url: landing_url,
        flow: currFlow,
        authorization_user_id: req.userId,
    };
    const state = uuidv4();
    await redis.setex(`authorization_state:${AuthorizationType.Steam}:${state}`, 60 * 60 * 12, JSON.stringify(payload));

    const redirectURL = appendQueryParamsToUrl(process.env.STEAM_REDIRECT_URL!, {
        "state": state,
    });
    const authURL = appendQueryParamsToUrl(process.env.STEAM_AUTH_URL!, {
        "openid.ns": OPENID_CHECK.ns,
        "openid.mode": "checkid_setup",
        "openid.return_to": redirectURL,
        "openid.realm": redirectURL,
        "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
        "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    });
    res.json(response.success({
        authorization_url: authURL
    }));
}


export class SteamAuthFlow extends AuthFlowBase {

    async validateCallbackState(req: any, res: NextApiResponse): Promise<ValidationResult> {
        return validateCallbackState(AuthorizationType.Steam, req, res);
    }

    async validateSteamCallbackOpenid(req: any): Promise<string> {
        const openIdNs = 'http://specs.openid.net/auth/2.0';
        // Steam的OpenID登录URL
        const steamLogin = 'https://steamcommunity.com/openid/login';
        // 用于验证Steam返回的URL是否符合预期格式的正则表达式
        const validationRegexp = /^(http|https):\/\/steamcommunity\.com\/openid\/id\/[0-9]+$/;
        const data = req.method === 'POST' ? req.body : req.query;

        if (data['openid.mode'] !== 'id_res') {
            logger.warn(`openid.mode want id_res but got ${data['openid.mode']}`);
            return "";
        }

        const params = new URLSearchParams();
        params.append('openid.assoc_handle', data['openid.assoc_handle']);
        params.append('openid.signed', data['openid.signed']);
        params.append('openid.sig', data['openid.sig']);
        params.append('openid.ns', data['openid.ns']);
        const signedItems = data['openid.signed'].split(',');
        signedItems.forEach((item: string) => {
            params.append('openid.' + item, data['openid.' + item]);
        });
        params.append('openid.mode', 'check_authentication');
        const response = await axios.post(steamLogin, params);
        const responseContent = response.data.split('\n');

        if (responseContent[0] !== 'ns:' + openIdNs || !responseContent[1].endsWith('true')) {
            logger.warn(`Unable to validate OpenID from response ${responseContent}`);
            return "";
        }
        const openIdUrl = data['openid.claimed_id'];
        if (!validationRegexp.test(openIdUrl)) {
            logger.warn(`Invalid steam id format:${openIdUrl}`);
            return "";
        }
        const steamId = this.extractSteamId(openIdUrl);
        return steamId ? steamId : "";
    }

    extractSteamId(encodedUrl: string): string | null {
        // 解码URL
        const decodedUrl = decodeURIComponent(encodedUrl);

        // 使用正则表达式提取数字
        const regex = /^https?:\/\/steamcommunity\.com\/openid\/id\/(\d+)$/;
        const match = decodedUrl.match(regex);
        if (match && match[1]) {
            return match[1];
        }
        return null;
    }

    async getAuthParty(req: any, authPayload: AuthorizationPayload): Promise<any> {
        const steamId = await this.validateSteamCallbackOpenid(req);
        if (!steamId) {
            logger.error(`validate steam id failed for auth:${authPayload.toString()}`);
            return null;
        }
        const steamAPI = new SteamWebAPI(process.env.STEAM_CLIENT_SECRET!);
        return await steamAPI.getUserSummary(steamId);
    }

    async queryUserConnectionFromParty(party: any): Promise<any> {
        return await UserSteam.findOne({'steam_id': party.id, 'deleted_time': null})
    }

    constructUserConnection(userId: string, authParty: any): any {
        return new UserSteam({
            user_id: userId,
            steam_id: authParty.steamID,
            communityvisibilitystate: authParty.communityvisibilitystate,
            personaname: authParty.nickname,
            commentpermission: authParty.commentPermission,
            profileurl: authParty.url,
            avatar: authParty.avatar.small,
            avatarmedium: authParty.avatar.medium,
            avatarfull: authParty.avatar.large,
            personastate: authParty.personaState,
            realname: authParty.realName,
            primaryclanid: authParty.primaryGroupID,
            timecreated: authParty.created,
            personastateflags: authParty.personaStateFlags,
            loccountrycode: authParty.countryCode,
            created_time: Date.now(),
        });
    }

    constructNewUser(authParty: any): any {
        return new User({
            user_id: uuidv4(),
            username: authParty.personaname,
            avatar_url: authParty.avatar.small,
            created_time: Date.now(),
        });
    }
}
