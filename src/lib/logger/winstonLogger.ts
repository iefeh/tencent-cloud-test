import * as winston from 'winston';
import {format} from 'date-fns';
import * as Sentry from '@sentry/nextjs';

// 创建一个自定义的Winston Transport
class SentryTransport extends winston.Transport {
    log(info, callback) {
        if (info.level === 'error') {
            // 当日志级别是 'error' 时，发送日志到Sentry
            Sentry.captureException(new Error(info.message));
        }

        // 确保执行Winston的内部逻辑
        callback();
    }
}

const logger = winston.createLogger({
    // 设置日志级别
    level: 'debug',
    format: winston.format.combine(
        // [%lvl%]   [%time%]   [%traceID%]   [%spanID%]   [%caller%]   -   %msg%
        winston.format.printf((info) => {
            const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
            return `[${info.level}]   [${timestamp}]   -   ${info.message}`
        }),
    ),
    transports: [
        new winston.transports.Console(),
        new SentryTransport(),
        // 更多 transports 可根据需要添加
    ],
});

export default logger;