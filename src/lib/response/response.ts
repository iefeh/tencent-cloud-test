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