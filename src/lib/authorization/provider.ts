import {OAuthOptions} from "@/lib/authorization/types";
import {OAuthProvider} from "@/lib/authorization/oauth";

const googleOAuthOps: OAuthOptions = {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    scope: process.env.GOOGLE_AUTH_SCOPE!,
    redirectURI: process.env.GOOGLE_REDIRECT_URL!,
    authEndpoint: process.env.GOOGLE_AUTH_URL!,
    tokenEndpoint: process.env.GOOGLE_TOKEN_URL!
}
export const googleOAuthProvider = new OAuthProvider(googleOAuthOps);

