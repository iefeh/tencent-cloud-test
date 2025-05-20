import { redis } from '@/lib/redis/client'
import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    res.status(200).json({ redis: redis.get("test") })
}