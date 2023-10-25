import {SendEmailCommand, SESClient} from "@aws-sdk/client-ses";

export const sesClient = new SESClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});


export const sendCaptchaEmail = async (toAddress: string, captcha: number) => {
    const createSendEmailCommand = (toAddress, fromAddress) => {
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
                        Data: `<b>Hello there, ${captcha}</b>`,
                    },
                    // Text: {
                    //     Charset: "UTF-8",
                    //     Data: "Hello world?",
                    // },
                },
                Subject: {
                    Charset: "UTF-8",
                    Data: "Login Verification",
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
        process.env.EMAIL_FROM,
    );
    await sesClient.send(sendEmailCommand);
};