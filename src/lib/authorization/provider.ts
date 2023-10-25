export interface AuthProvider {
    // 认证当前请求
    authenticate(query: Partial<{
        [key: string]: string | string[];
    }>): Promise<boolean>;

    
    getUserInfo(token: string): Promise<any>;

    createUser(data: any): Promise<any>;

    findUser(connection: any): Promise<any>;
}