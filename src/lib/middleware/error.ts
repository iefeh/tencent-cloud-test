import * as Sentry from '@sentry/nextjs';
import {NextApiResponse} from "next";
import {UserContextRequest} from "@/lib/middleware/auth";
import * as response from "@/lib/response/response";
import logger from "@/lib/logger/winstonLogger";

export const errorInterceptor = (resp: any = response.serverError()) => {
    return (req: UserContextRequest, res: NextApiResponse, next: () => void) => {
        try {
            next();
        } catch (error) {
            logger.error(error);
            Sentry.captureException(error);
            res.status(500).json(resp);
        }
    };
};
