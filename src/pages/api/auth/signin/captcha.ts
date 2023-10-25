import * as response from '../../../../lib/response/response';
import {NextApiResponse, NextApiRequest} from 'next'
import {sendCaptchaEmail} from '@/lib/aws/ses';
import {redis} from '@/lib/redis/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const {email} = req.query;
    if (!email) {
        res.json(response.invalidParams());
        return
    }
    const captcha = Math.floor(100000 + Math.random() * 900000);
    try {
        await redis.setex(`login_captcha:${email}`, 60 * 60 * 15, captcha);
        await sendCaptchaEmail("no-reply@moonveil.studio", captcha);
        res.json(response.success());
    } catch (e) {
        console.error(e);
        res.json(response.serverError());
    }
}