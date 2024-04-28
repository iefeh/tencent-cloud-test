import oauth2Model from './oauth2Model';

const oauth2Server = require('oauth2-server');
const server = new oauth2Server({
    model: oauth2Model,
    allowBearerTokensInQueryString: true,
    accessTokenLifetime: 60 * 60 * 24 * 30 // token过期时间30天
});

export default server;