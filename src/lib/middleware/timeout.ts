import {UserContextRequest} from "@/lib/middleware/auth";
import {NextApiResponse} from "next";
import * as Sentry from "@sentry/nextjs";
import * as response from "@/lib/response/response";

export const timeoutInterceptor = (resp: any = response.serverError(), timeout: number = 10000) => {
    return (req: UserContextRequest, res: NextApiResponse, next: () => void) => {
        const timeoutId = setTimeout(() => {
            if (!res.headersSent) {
                const requestURL = req.url;
                // 创建请求头的副本并移除 Authorization 字段
                const filteredHeaders = {...req.headers};
                delete filteredHeaders.authorization;

                // 在 Sentry 中记录超时以及请求的详细信息
                Sentry.withScope(scope => {
                    scope.setTag('url', requestURL);
                    scope.setExtra('headers', filteredHeaders);
                    // 确保没有敏感信息
                    scope.setExtra('body', req.body);
                    scope.setLevel("error");
                    Sentry.captureMessage(`request timeout: ${requestURL}`, "error");
                });
                res.status(500).json(resp);
            }
        }, timeout);

        res.on('finish', () => clearTimeout(timeoutId));
        next();
    };
};