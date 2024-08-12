export interface ResponseData<T> {
    // 响应码，默认成功时为1
    code: number;
    // 响应码对应的消息，默认成功为Success
    msg: string;
    data: T | null;
}

export enum ResponseCode {
    SUCCESS = 1,
    ERROR_SERVER_INTERNAL_ERROR = -1,
    ERROR_UNAUTHORIZED = -2,
    ERROR_INVALID_PARAMS = -3,
    ERROR_NOT_FOUND = -4,
    ERROR_CAPTCHA_EXPIRED = -5,
    ERROR_CAPTCHA_MISMATCH = -6,
    ERROR_AUTHORIZATION_DENIED = -7,
    ERROR_SEND_CAPTCHA_DISALLOWED = -8,
    ERROR_ACCOUNT_DUPLICATE_BOUND = -9,
    ERROR_ACCOUNT_ALREADY_BOUND_MEDIA = -10,
    ERROR_WALLET_SIGNATURE_MISMATCH = -11,
    ERROR_WALLET_SIGNATURE_EXPIRED = -12,
    ERROR_WALLET_ALREADY_BOUND_TO_OTHERS = -13,
    ERROR_ACCOUNT_ALREADY_BOUND_WALLET = -14,
    ERROR_CONNECTION_COOLING_DOWN = -15,
    ERROR_EMAIL_BOUND_TO_OTHERS = -16,
    ERROR_TOO_MANY_REQUESTS = -17,
    ERROR_UNKNOWN_INVITE_CODE = -18,
    ERROR_USERNAME_TOO_LONG = -19,
    ERROR_SIGNUP_CONFIRMATION = -20,
    ERROR_SIGNUP_CONFIRMATION_EXPIRED = -21,
    ERROR_WALLET_NOT_CONNECTED = -22, 
    ERROR_USER_SELF_DESTRUCTED = -23,
    ERROR_TRANSACTION_NOT_RECONGNIZED = -24,
    ERROR_INSUFFICIENT_TICKETS = -25,
    // 添加对应的响应码
}

const ResponseMessages = {
    [ResponseCode.SUCCESS]: 'Success',
    [ResponseCode.ERROR_SERVER_INTERNAL_ERROR]: 'Server Internal Error',
    [ResponseCode.ERROR_UNAUTHORIZED]: 'Unauthorized',
    [ResponseCode.ERROR_INVALID_PARAMS]: 'Invalid Parameter',
    [ResponseCode.ERROR_NOT_FOUND]: 'Not Found',
    // 验证码失效，常见于验证码找不到
    [ResponseCode.ERROR_CAPTCHA_EXPIRED]: 'Captcha Expired',
    // 验证码不匹配，常见于验证码校验
    [ResponseCode.ERROR_CAPTCHA_MISMATCH]: 'Captcha Mismatch',
    // 授权拒绝，常见于Oauth2授权
    [ResponseCode.ERROR_AUTHORIZATION_DENIED]: 'Authorization Denied',
    // 不允许发送验证码，间隔不对或者IP受限
    [ResponseCode.ERROR_SEND_CAPTCHA_DISALLOWED]: 'Sending Captcha Temporarily Disallowed',
    // 社媒重复绑定，当前社媒已经绑定到其他账号
    [ResponseCode.ERROR_ACCOUNT_DUPLICATE_BOUND]: 'The platform is already connected to another account.',
    // 当前账户已绑定对应社媒
    [ResponseCode.ERROR_ACCOUNT_ALREADY_BOUND_MEDIA]: 'Account already connected the platform.',
    // 钱包签名不匹配
    [ResponseCode.ERROR_WALLET_SIGNATURE_MISMATCH]: "Wallet Signature Mismatch",
    // 钱包签名已过期
    [ResponseCode.ERROR_WALLET_SIGNATURE_EXPIRED]: "Wallet Signature Expired. Please Make Sure Your System Time Up To Date",
    // 钱包已经绑定到其他用户
    [ResponseCode.ERROR_WALLET_ALREADY_BOUND_TO_OTHERS]: "Wallet already bound to others",
    // 账户已经绑定了钱包
    [ResponseCode.ERROR_ACCOUNT_ALREADY_BOUND_WALLET]: "Account already bound wallet",
    // 重连的目标账户冷却中
    [ResponseCode.ERROR_CONNECTION_COOLING_DOWN]: "The third-party account is under a 12-hour reconnection wait.",
    // 邮件已经被其他人绑定
    [ResponseCode.ERROR_EMAIL_BOUND_TO_OTHERS]: "Email already bound to others",
    // 请求过多
    [ResponseCode.ERROR_TOO_MANY_REQUESTS]: "Too many requests.",
    // 未知邀请码
    [ResponseCode.ERROR_UNKNOWN_INVITE_CODE]: "Unknown invite code.",
    // 昵称过长
    [ResponseCode.ERROR_USERNAME_TOO_LONG]: "Username too long.",
    // 注册二次确认
    [ResponseCode.ERROR_SIGNUP_CONFIRMATION]: "Signup confirmation required",
    // 注册二次确认已过期
    [ResponseCode.ERROR_SIGNUP_CONFIRMATION_EXPIRED]: "Signup confirmation expired",
    // 必须连接钱包
    [ResponseCode.ERROR_WALLET_NOT_CONNECTED]: "You must connect wallet first",
    // 门票不足
    [ResponseCode.ERROR_INSUFFICIENT_TICKETS]: "There aren't enough tickets for this account",
    // 用户账户已自毁
    [ResponseCode.ERROR_USER_SELF_DESTRUCTED]: "Account is self destructed.",
    // 未识别的交易
    [ResponseCode.ERROR_TRANSACTION_NOT_RECONGNIZED]: "Transaction not recongnized."
    // 添加响应码对应的msg
}

function build<T>(code: ResponseCode) {
    return (data?: T): ResponseData<T> => {
        return {
            code,
            msg: ResponseMessages[code] || 'Unknown Error',
            data: data || null
        };
    };
}

// 添加快速响应函数
export const success = build(ResponseCode.SUCCESS);
export const serverError = build(ResponseCode.ERROR_SERVER_INTERNAL_ERROR);
export const unauthorized = build(ResponseCode.ERROR_UNAUTHORIZED);
export const invalidParams = build(ResponseCode.ERROR_INVALID_PARAMS);
export const notFound = build(ResponseCode.ERROR_NOT_FOUND);
export const captchaExpired = build(ResponseCode.ERROR_CAPTCHA_EXPIRED);
export const captchaMismatch = build(ResponseCode.ERROR_CAPTCHA_MISMATCH);
export const authorizationDenied = build(ResponseCode.ERROR_AUTHORIZATION_DENIED);
export const sendCaptchaDisallowed = build(ResponseCode.ERROR_SEND_CAPTCHA_DISALLOWED);
export const accountDuplicateBound = build(ResponseCode.ERROR_ACCOUNT_DUPLICATE_BOUND);
export const accountAlreadyBoundMedia = build(ResponseCode.ERROR_ACCOUNT_ALREADY_BOUND_MEDIA);
export const walletSignatureMismatch = build(ResponseCode.ERROR_WALLET_SIGNATURE_MISMATCH);
export const walletSignatureExpired = build(ResponseCode.ERROR_WALLET_SIGNATURE_EXPIRED);
export const walletAlreadyBoundToOthers = build(ResponseCode.ERROR_WALLET_ALREADY_BOUND_TO_OTHERS);
export const accountAlreadyBoundWallet = build(ResponseCode.ERROR_ACCOUNT_ALREADY_BOUND_WALLET);
export const connectionCoolingDown = build(ResponseCode.ERROR_CONNECTION_COOLING_DOWN);
export const emailAlreadyBoundToOthers = build(ResponseCode.ERROR_EMAIL_BOUND_TO_OTHERS);
export const tooManyRequests = build(ResponseCode.ERROR_TOO_MANY_REQUESTS);
export const unknownInviteCode = build(ResponseCode.ERROR_UNKNOWN_INVITE_CODE);
export const usernameTooLong = build(ResponseCode.ERROR_USERNAME_TOO_LONG);
export const signupConfirmation = build(ResponseCode.ERROR_SIGNUP_CONFIRMATION);
export const signupConfirmationExpired = build(ResponseCode.ERROR_SIGNUP_CONFIRMATION_EXPIRED);
export const walletNotConnected = build(ResponseCode.ERROR_WALLET_NOT_CONNECTED);
export const insufficientTickets = build(ResponseCode.ERROR_INSUFFICIENT_TICKETS);
export const userSelfDestructed = build(ResponseCode.ERROR_USER_SELF_DESTRUCTED);
export const transactionNotRecongnized = build(ResponseCode.ERROR_USER_SELF_DESTRUCTED);
