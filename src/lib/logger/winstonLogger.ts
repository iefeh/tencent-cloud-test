// app/logger/winstonLogger.ts

import * as winston from 'winston';
import {format} from 'date-fns';

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
        // 更多 transports 可根据需要添加
    ],
});

export default logger;