import {Profile, Strategy as GoogleStrategy, GoogleCallbackParameters, VerifyCallback} from "passport-google-oauth20";
import passport from "passport";
import connectMongo from '../mongodb/client';
import UserGoogle from '../models/UserGoogle';
import User from '../models/User';
import {v4 as uuidv4} from 'uuid';
import * as response from '../response/response';


const googleVerify = async (
    req,
    accessToken: string,
    refreshToken: string,
    params: GoogleCallbackParameters,
    profile: Profile,
    done: VerifyCallback) => {
    try {
        // 传递请求的参数，在业务需要的情况下解析授权的流程，目前默认是登录
        // console.log("google verify params:", req.query);
        await connectMongo();

        const guser = profile._json;
        // 查询用户是否存在
        let userGoogle = await UserGoogle.findOne({'google_id': guser.sub, 'deleted_time': null})
        if (!userGoogle) {
            // 新创建用户与其谷歌绑定
            const newUser = new User({
                user_id: uuidv4(),
                username: guser.name,
                avatar_url: guser.picture,
                created_time: Date.now(),
            });
            userGoogle = new UserGoogle({
                user_id: newUser.user_id,
                google_id: guser.sub,
                email: guser.email,
                email_verified: guser.email_verified,
                given_name: guser.given_name,
                family_name: guser.family_name,
                name: guser.name,
                locale: guser.locale,
                picture: guser.picture,
                profile: guser.profile,
                created_time: Date.now(),
            });
            await userGoogle.save();
            await newUser.save();
        }
        return done(null, profile, response.success(userGoogle.user_id));
    } catch (e) {
        console.error(e);
        return done(null, profile, response.serverError());
    }

}

passport.use("google", new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: "http://localhost:3000/api/auth/callback/google",
        passReqToCallback: true,
    },
    googleVerify
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