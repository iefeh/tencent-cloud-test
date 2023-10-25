import * as response from '../../../../lib/response/response';
import {NextApiResponse, NextApiRequest} from 'next'
import {sendCaptchaEmail} from '@/lib/aws/ses';
import {redis} from '@/lib/redis/client';
import {createRouter} from "next-connect";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(async (req, res) => {
    const {email, quick_fill_url} = req.query;
    if (!email) {
        res.json(response.invalidParams());
        return
    }
    const captcha = Math.floor(100000 + Math.random() * 900000);
    await redis.setex(`login_captcha:${email}`, 60 * 60 * 15, captcha);
    await sendCaptchaEmail("no-reply@moonveil.studio", captcha, quick_fill_url);
    res.json(response.success());
});

// this will run if none of the above matches
router.all((req, res) => {
    res.status(405).json({
        error: "Method not allowed",
    });
});

export default router.handler({
    onError(err, req, res) {
        console.error(err);
        res.json(response.serverError());
    },
});