import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import getMongoConnection from "@/lib/mongodb/client";
import sharp from 'sharp';
import {v4 as uuidv4} from "uuid";
import {upload2public} from "@/lib/aws/s3";
import * as Sentry from "@sentry/nextjs";

const formidable = require('formidable');

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).post(async (req, res) => {
    try {
        await getMongoConnection();

        const form = new formidable.IncomingForm();
        console.log("parsing request:");
        const [fields, files] = await form.parse(req);
        const avatarFile = files.avatar;
        console.log("avatarFile:", avatarFile[0].filepath);
        const image = sharp(avatarFile[0].filepath);
        const metadata = await image.metadata();
        let buffer;
        if (metadata.format !== 'webp') {
            // 如果图片不是webp格式，转换为webp
            buffer = await image.webp().toBuffer();
        } else {
            // 如果图片已经是webp格式，直接读取文件
            buffer = await image.toBuffer();
        }
        console.log("uploading to s3");
        const s3Key = `avatar/${req.userId}/${uuidv4()}.webp`
        await upload2public("moonveil-public", s3Key, buffer, "image/webp");
        return res.json(response.success({
            avatar_url: `https://moonveil-public.s3.ap-southeast-2.amazonaws.com/${s3Key}`,
        }));
    } catch (error) {
        console.error(error)
        Sentry.captureException(error);
    }
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
        res.status(500).json(response.serverError());
    },
});
export const config = {
    api: {
        bodyParser: false,
    },
};