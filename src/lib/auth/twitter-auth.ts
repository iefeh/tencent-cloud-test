import {Strategy} from '@superfaceai/passport-twitter-oauth2';
import passport from "passport";
import connectMongo from '../mongodb/client';
import UserGoogle from '../models/UserGoogle';
import {v4 as uuidv4} from 'uuid';


const verifyCallback = async (req, accessToken, refreshToken, params, profile, done) => {
    // 传递请求的参数，在业务需要的情况下解析授权的流程，目前默认是登录
    // console.log("google verify params:", req.query);
    await connectMongo();
    console.log("profile:", profile);
    return done(null, profile, {test_id: "test"});
    // const authUser = profile._json;
    // // 查询用户是否存在
    // const userGoogle = await UserGoogle.findOne({'google_id': authUser.sub, 'deleted_time': null})
    // if (userGoogle) {
    //     return done(null, profile, {test_id: "test"});
    // }
    // // 新创建用户谷歌绑定
    // const newUserGoogle = {
    //     user_id: uuidv4(),
    //     google_id: authUser.sub,
    //     email: authUser.email,
    //     email_verified: authUser.email_verified,
    //     given_name: authUser.given_name,
    //     family_name: authUser.family_name,
    //     name: authUser.name,
    //     locale: authUser.locale,
    //     picture: authUser.picture,
    //     profile: authUser.profile,
    //     created_time: Date.now(),
    // };
    // await UserGoogle.create(newUserGoogle);
    // return done(null, newUserGoogle, {test_id: "test"});
}

passport.use("twitter", new Strategy({
        clientID: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
        clientType: 'confidential',
        callbackURL: "http://127.0.0.1:3000/api/auth/callback/twitter",
        passReqToCallback: true,
    },
    verifyCallback
));


// passport.serializeUser stores user object passed in the cb method above in req.session.passport
// passport.serializeUser((user: any, done) => {
//     console.log("serializeUser:", user)
//     done(null, user);
// });

// passport.deserializeUser stores the user object in req.user
// passport.deserializeUser((obj: any, done) => {
//     console.log("deserializeUser:", obj)
//     done(null, obj);
// });

// for broader explanation of serializeUser and deserializeUser visit https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize

// An article that explains the concept of process.nextTick https://nodejs.dev/learn/understanding-process-nexttick