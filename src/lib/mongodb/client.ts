import mongoose from 'mongoose'

export function isDuplicateKeyError(error: any): boolean {
    return error && error.code == 11000
}

declare global {
    var mongoose: any // This must be a `var` and not a `let / const`
}


let cached = global.mongooseConnections

if (!cached) {
    cached = global.mongooseConnections = {}
}

// 通用的数据库连接函数
async function connectToDatabase(uri) {
    let cached = global.mongooseConnections[uri];

    if (!cached) {
        cached = global.mongooseConnections[uri] = {conn: null};
    }

    if (cached.conn) {
        return cached.conn;
    }

    cached.conn = mongoose.createConnection(uri, {});
    return cached.conn;
}

// TODO:还可以通过connect的option指定数据库名称，但是此处使用外部指定的方式

// 连接至discord库
export async function connectToMongoDbDiscord() {
    const mongoURI = process.env.MONGODB_DISCORD_URI!
    if (!mongoURI) {
        throw new Error(
            'Please define the MONGODB_DISCORD_URI environment variable'
        )
    }
    return connectToDatabase(mongoURI);
}

// 连接至dev库
async function connectToMongoDbDev() {
    const mongoURI = process.env.MONGODB_DEV_URI!
    if (!mongoURI) {
        throw new Error(
            'Please define the MONGODB_DEV_URI environment variable'
        )
    }
    return connectToDatabase(mongoURI);
}

export default connectToMongoDbDev