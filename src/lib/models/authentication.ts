// AuthorizationPayload 用于在授权过程中传递重要信息，该对象会被用于生成JWT token，
// 并作为state字段在授权过程中传递，JWT会默认生成Issued At(iat)的秒级时间戳字段。
export interface AuthorizationPayload {
    // 授权完毕后的落地页，我们会在授权结束后重定向到该地址
    landing_url: string;
    // 授权流程
    flow: AuthorizationFlow;
    // 当前授权的用户，只有用户在已登录(connect)时存在
    authorization_user_id?: string;
    // 当前授权的code识别码
    code_challenge?: string;
    // 新用户登录时的邀请人id
    inviter_id?: string;
    // 注册模式
    signup_mode?: string;
}


export enum AuthorizationFlow {
    LOGIN = "LOGIN",
    CONNECT = "CONNECT"
}