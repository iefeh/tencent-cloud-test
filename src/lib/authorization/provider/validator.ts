import * as response from "@/lib/response/response";
import {redis} from "@/lib/redis/client";
import {AuthorizationPayload} from "@/lib/models/authentication";
import {appendQueryParamsToUrl} from "@/lib/utils/url";
import {AuthorizationType} from "@/lib/authorization/types";


export async function validateCallbackState(authType: AuthorizationType, req: any, res: any): Promise<{ passed: boolean, authPayload?: AuthorizationPayload }> {
    const {state, error, code} = req.query;
    if (!state) {
        console.log("callback state not found");
        res.json(response.notFound());
        return {passed: false};
    }
    const stateVal = await redis.get(`authorization_state:${authType}:${state}`);
    if (!stateVal) {
        res.json(response.notFound());
        return {passed: false};
    }
    const authPayload = JSON.parse(stateVal) as AuthorizationPayload;
    if (error) {
        if (error.includes('access_denied')) {
            const landing_url = appendQueryParamsToUrl(authPayload.landing_url, response.authorizationDenied());
            res.redirect(landing_url);
            return {passed: false, authPayload: authPayload};
        }
        console.error(error);
        const landing_url = appendQueryParamsToUrl(authPayload.landing_url, response.serverError());
        res.redirect(landing_url);
        return {passed: false, authPayload: authPayload};
    }
    return {passed: true, authPayload: authPayload};
}