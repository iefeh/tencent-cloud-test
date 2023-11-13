import * as response from "@/lib/response/response";
import {redis} from "@/lib/redis/client";
import {AuthorizationPayload} from "@/lib/models/authentication";
import {AuthProvider} from "@/lib/authorization/types";
import {appendQueryParamsToUrl} from "@/lib/utils/url";


export async function validateCallbackState(provider: AuthProvider, req, res): Promise<{ passed: boolean, authPayload?: AuthorizationPayload }> {
    const {state, error, code} = req.query;
    if (!state) {
        console.log("callback state not found");
        res.json(response.notFound());
        return {passed: false};
    }
    console.log("provider:", provider)
    const stateVal = await redis.get(`authorization_state:${provider}:${state}`);
    if (!stateVal) {
        res.json(response.notFound());
        return {passed: false};
    }
    const authPayload = JSON.parse(stateVal) as AuthorizationPayload;
    if (error) {
        if (error.includes('access_denied')) {
            const landing_url = appendQueryParamsToUrl(authPayload.landing_url, response.authorizationDenied());
            res.redirect(landing_url);
            return {passed: false};
        }
        console.error(error);
        const landing_url = appendQueryParamsToUrl(authPayload.landing_url, response.serverError());
        res.redirect(landing_url);
        return {passed: false};
    }
    return {passed: true, authPayload: authPayload};
}