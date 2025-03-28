import {S3Client, PutObjectCommand} from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
    region: process.env.PROJECT_AWS_REGION as string,
    credentials: {
        accessKeyId: process.env.PROJECT_AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.PROJECT_AWS_SECRET_ACCESS_KEY as string
    }
});

export async function upload2public(bucket: string, key: string, buffer: Buffer, contentType: string) {
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ACL: 'public-read'
    });

    return await s3Client.send(command);
}