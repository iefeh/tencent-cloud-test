import {v4 as uuidv4} from "uuid";
import {redis} from "@/lib/redis/client";
import {SignupPayload} from "@/lib/authorization/types";

export async function generateUserSession(userId: string): Promise<string> {
    const token = uuidv4();
    await redis.setex(`user_session:${token}`, 60 * 60 * 24 * 7, userId);
    return token;
}

export async function generateUserSignupSession(payload: SignupPayload): Promise<string> {
    const token = uuidv4();
    await redis.setex(`user_signup_confirmation:${token}`, 60 * 5, JSON.stringify(payload));
    return token;
}