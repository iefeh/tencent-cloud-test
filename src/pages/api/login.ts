import User from '@/lib/models/User'
import { redis } from '@/lib/redis/client'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let user = await User.findOne({ user_id: "4fa8b6f9-d296-4e63-af85-19ce2d9c2cfa" })
    const test = await redis.get("test")
    res.status(200).json({ redis: test, user })
}