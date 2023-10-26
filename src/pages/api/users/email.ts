import * as response from '../../../lib/response/response';
import {NextApiResponse, NextApiRequest} from 'next'
import {sendCaptchaEmail} from '@/lib/aws/ses';
import {redis} from '@/lib/redis/client';
import {createRouter} from "next-connect";
import * as sgMail from '@sendgrid/mail';

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(async (req, res) => {
    const {email, quick_fill_url} = req.query;
    if (!email) {
        res.json(response.invalidParams());
        return
    }
    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
    const msg = {
        to: email, // Change to your recipient
        from: 'no-reply@moonveil.studio', // Change to your verified sender
        subject: 'Sending with SendGrid is Fun',
        text: 'and easy to do anywhere, even with Node.js',
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    }
    sgMail
        .send(msg)
        .then(() => {
            console.log('Email sent')
        })
        .catch((error) => {
            console.error(error)
        })
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