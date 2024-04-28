import {OAuthModel} from './model';

// https://node-oauthoauth2-server.readthedocs.io/en/master/model/spec.html
const oAuth2Server = require('@node-oauth/oauth2-server');
// https://node-oauthoauth2-server.readthedocs.io/en/master/api/oauth2-server.html
const OAuth2Server = new oAuth2Server({
    model: OAuthModel,
    // token过期时间30天
    accessTokenLifetime: 60 * 60 * 24 * 30
});

export default OAuth2Server;