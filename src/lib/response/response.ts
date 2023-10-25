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
    // 添加对应的响应码
}

const ResponseMessages = {
    [ResponseCode.SUCCESS]: 'Success',
    [ResponseCode.ERROR_SERVER_INTERNAL_ERROR]: 'Server Internal Error',
    [ResponseCode.ERROR_UNAUTHORIZED]: 'Unauthorized',
    [ResponseCode.ERROR_INVALID_PARAMS]: 'Invalid Parameter',
    [ResponseCode.ERROR_NOT_FOUND]: 'Not Found',
    [ResponseCode.ERROR_CAPTCHA_EXPIRED]: 'Captcha Expired',
    [ResponseCode.ERROR_CAPTCHA_MISMATCH]: 'Captcha Mismatch',
    [ResponseCode.ERROR_AUTHORIZATION_DENIED]: 'Authorization Denied',
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