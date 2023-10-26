import {SendEmailCommand, SESClient} from "@aws-sdk/client-ses";
import {appendQueryParamToUrl} from "@/lib/utils/url";
import {generateEmailHTML} from "@/lib/templates/captchat";
import * as sgMail from '@sendgrid/mail';

export const sesClient = new SESClient({
    region: process.env.AWS_REGION ?? "",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? ""
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
        html: generateEmailHTML(captcha, quickFillURL as string),
    }
    await sgMail.send(msg);
}

export const sendCaptchaEmail = async (toAddress: string, captcha: number, quickFillURL?: string) => {
    if (!quickFillURL) {
        quickFillURL = 'https://www.moonveil.gg/email/captcha/quickfill'
    }
    quickFillURL = appendQueryParamToUrl(quickFillURL, 'code', captcha);
    const createSendEmailCommand = (toAddress: string, fromAddress: string) => {
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
                        Data: generateEmailHTML(captcha, quickFillURL ?? ""),
                    },
                },
                Subject: {
                    Charset: "UTF-8",
                    Data: "Verification Code",
                },
            },
            Source: fromAddress,
            ReplyToAddresses: [
                /* more items */
            ],
        });
    };
    const sendEmailCommand = createSendEmailCommand(
        toAddress,
        process.env.EMAIL_FROM ?? "",
    );
    await sesClient.send(sendEmailCommand);
};