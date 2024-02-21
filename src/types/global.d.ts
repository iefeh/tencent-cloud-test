// global.d.ts
import {Connection} from "mongoose";

// 确保这个文件被当作一个模块处理
export {};

declare global {
    var mongooseConnections: {
        [key: string]: {
            conn: Connection;
        };
    };
}