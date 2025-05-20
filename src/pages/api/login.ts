import { redis } from '@/lib/redis/client'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const test = await redis.get("test")
    res.status(200).json({ redis: test })
}