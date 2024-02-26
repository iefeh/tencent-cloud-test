import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {UserContextRequest} from "@/lib/middleware/auth";
import sharp from 'sharp';
import {v5 as uuidv5} from "uuid";
import {upload2public} from "@/lib/aws/s3";
import fs from 'fs';
import path from 'path';
import Badge, {BadgeSeries, RequirementType} from "@/lib/models/Badge";


const router = createRouter<UserContextRequest, NextApiResponse>();
const NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';

router.post(async (req, res) => {
    const badgesDirPath = "/Users/yuanyouhe/projects/MoonveilEntertainment/moonveil-site/src/pages/api/badges/images";
    const badgeNames = fs.readdirSync(badgesDirPath);
    for (const badgeName of badgeNames) {
        const badgeDirPath = path.join(badgesDirPath, badgeName);
        const imageFiles = fs.readdirSync(badgeDirPath);
        let series = new Map<string, BadgeSeries>();
        for (const fileName of imageFiles) {
            const badgePath = path.join(badgeDirPath, fileName);
            const badgeLevel = fileName.substr(-5, 1);
            const s3BadgeName = badgeName.toLowerCase().replaceAll(" ", "_");
            // 如果图片不是webp格式，转换为webp
            const icon = sharp(badgePath);
            const iconBuffer = await icon.resize(300, 300).webp().toBuffer();
            const img = sharp(badgePath);
            const buffer = await img.webp({
                quality: 70,
            }).toBuffer();
            // 上传到s3
            await upload2public("moonveil-public", `badges/${s3BadgeName}/lvl${badgeLevel}/icon.webp`, iconBuffer, "image/webp");
            await upload2public("moonveil-public", `badges/${s3BadgeName}/lvl${badgeLevel}/img.webp`, buffer, "image/webp");
            series.set(badgeLevel, {
                description: "",
                icon_url: `https://moonveil-public.s3.ap-southeast-2.amazonaws.com/badges/${s3BadgeName}/lvl${badgeLevel}/icon.webp`,
                image_url: `https://moonveil-public.s3.ap-southeast-2.amazonaws.com/badges/${s3BadgeName}/lvl${badgeLevel}/img.webp`,
                // 初始化requirements
                requirements: [
                    {
                        type: RequirementType.UserMetric,
                        properties: {
                            metric: "retweet_count",
                            operator: ">=",
                            value: 0,
                            reward_moon_beam: 0,
                        },
                    }
                ],
                open_for_mint: false,
            });
        }
        // 构建badge并保存
        await Badge.updateOne(
            {id: uuidv5(badgeName, NAMESPACE)},
            {
                $set: {
                    name: badgeName,
                    description: "",
                    series: series,
                    obtain_url: "",
                    chain_id: "80001",
                    updated_time: Date.now(),
                    active: false,
                },
                $setOnInsert: {
                    created_time: Date.now(),
                },
            },
            {upsert: true},
        );
    }
    return res.json(response.success());
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