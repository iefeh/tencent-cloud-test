import {SendEmailCommand, SESClient} from "@aws-sdk/client-ses";
import {appendQueryParamToUrl} from "@/lib/utils/url";
import * as sgMail from '@sendgrid/mail';
import {generateCaptchaEmailHTML} from "@/lib/templates/email";

export const sesClient = new SESClient({
    region: process.env.AWS_REGION as string,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
    }
});

export const sendGridCaptchaEmail = async (toAddress: string, captcha: number, quickFillURL?: string) => {
    if (!quickFillURL) {
        quickFillURL = 'https://www.moonveil.gg/email/captcha/quickfill'
    }
    quickFillURL = appendQueryParamToUrl(quickFillURL, 'code', captcha);
    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
    const msg = {
        to: toAddress, // Change to your recipient
        from: {
            email: process.env.EMAIL_FROM as string,
            name: process.env.EMAIL_FROM_NAME as string,
        },
        subject: 'Verification Code',
        html: generateCaptchaEmailHTML(captcha, quickFillURL as string),
    }
    await sgMail.send(msg);
}

export const sendCaptchaEmail = async (toAddress: string, captcha: number, quickFillURL?: string) => {
    if (!quickFillURL) {
        quickFillURL = 'https://www.moonveil.gg/email/captcha/quickfill'
    }
    quickFillURL = appendQueryParamToUrl(quickFillURL, 'code', captcha);
    const createSendEmailCommand = (toAddress: string, fromAddress: string, fromName: string) => {
        return new SendEmailCommand({
            Destination: {
                /* required */
                CcAddresses: [
                    /* more items */
                ],
                ToAddresses: [
                    toAddress,
                    /* more To-email addresses */
                ],
            },
            Message: {
                /* required */
                Body: {
                    /* required */
                    Html: {
                        Charset: "UTF-8",
                        Data: generateCaptchaEmailHTML(captcha, quickFillURL as string),
                    },
                },
                Subject: {
                    Charset: "UTF-8",
                    Data: "Verification Code",
                },
            },
            Source: `${fromName} <${fromAddress}>`,
            ReplyToAddresses: [
                /* more items */
            ],
        });
    };
    const sendEmailCommand = createSendEmailCommand(
        toAddress,
        process.env.EMAIL_FROM as string,
        process.env.EMAIL_FROM_NAME as string,
    );
    await sesClient.send(sendEmailCommand);
};