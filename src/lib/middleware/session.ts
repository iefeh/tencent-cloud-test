import {v4 as uuidv4} from "uuid";
import {redis} from "@/lib/redis/client";

export async function generateUserSession(userId: string): Promise<string> {
    const token = uuidv4();
    await redis.setex(`user_session:${token}`, 60 * 60 * 24 * 7, userId);
    return token;
}