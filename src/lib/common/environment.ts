
// 根据NODE_ENV返回对应的域名
export function currentDomain(): string {
    switch (process.env.NODE_ENV) {
        case "development":
            return "https://dev.moonveil.gg";
        case "production":
            return "https://moonveil.gg";
        default:
            return "https://moonveil.gg";
    }
}