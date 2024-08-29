import mongoose, {Connection} from 'mongoose'

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
function connectToDatabase(uri: string): Connection {
    let cached = global.mongooseConnections[uri];
    if (!cached) {
        cached = global.mongooseConnections[uri] = {conn: mongoose.createConnection(uri, {autoIndex: false,})};
    }
    return cached.conn;
}

// TODO:还可以通过connect的option指定数据库名称，但是此处使用外部指定的方式

// 连接至discord库
export function connectToMongoDbDiscord(): Connection {
    const mongoURI = process.env.MONGODB_DISCORD_URI!
    if (!mongoURI) {
        throw new Error(
            'Please define the MONGODB_DISCORD_URI environment variable'
        )
    }
    return connectToDatabase(mongoURI);
}

// 连接至dev库
function connectToMongoDbDev(): Connection {
    const mongoURI = process.env.MONGODB_DEV_URI!
    if (!mongoURI) {
        throw new Error(
            'Please define the MONGODB_DEV_URI environment variable'
        )
    }
    return connectToDatabase(mongoURI);
}

export default connectToMongoDbDev

// 连接至dev库
export function connectToMongoDb2048(): Connection {
    const mongoURI = process.env.MONGODB_2048_URI!
    if (!mongoURI) {
        throw new Error(
            'Please define the MONGODB_2048_URI environment variable'
        )
    }
    return connectToDatabase(mongoURI);
}

// 连接至dev库
export function connectToMongoDbGoldminer(): Connection {
    const mongoURI = process.env.MONGODB_GOLDMINER_URI!
    if (!mongoURI) {
        throw new Error(
            'Please define the MONGODB_2048_URI environment variable'
        )
    }
    return connectToDatabase(mongoURI);
}