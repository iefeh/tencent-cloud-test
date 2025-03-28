import type {NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {UserContextRequest} from "@/lib/middleware/auth";
import {AuthorizationType} from "@/lib/authorization/types";
import {redis} from "@/lib/redis/client";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.get(async (req, res) => {
    // 撤销用户的cd
    // await redis.zrem("moon_beam_lb", [
    //     "2498ed5b-b8d9-4a43-acc2-b103784faa69",
    //     "4fa8b6f9-d296-4e63-af85-19ce2d9c2cfa",
    //     "ddbb8b0b-4eb6-4285-8013-af5706f90485",
    //     "5c1fdf9f-983d-4750-865d-e310318ccf59",
    //     "6923e967-d0ad-447f-8f45-625f8a369c2b",
    //     "69f23d5c-3104-4fc7-8121-361a0107d884",
    //     "1b62b264-c417-41b7-a17b-fc9a0e2884f5",
    //     "eb658100-4b70-4fc2-8b39-4e7a186c95fa",
    //     "8464c6fb-9201-46a0-a875-95058b74edbb",
    //     "293073ae-5f25-4eac-a271-cde5b86bd268",
    //     "e1c01e70-27fa-474c-8369-3b4ed35104c3",
    //     "705f08b2-8ad4-43c3-8fcc-e6f3a56eafc3",
    // ],);
    // await redis.del([
    //     `reconnect_cd:${AuthorizationType.Wallet}:0x58a7f8e93900a1a820b46c23df3c0d9783b24d05`,
    //     `reconnect_cd:${AuthorizationType.Twitter}:1622609841528385536`,
    //     `reconnect_cd:${AuthorizationType.Discord}:820332439892262912`,
    //     `reconnect_cd:${AuthorizationType.Steam}:76561199543367461`,
    //     `reconnect_cd:${AuthorizationType.Google}:101001953857805044141`,
    // ]);
    res.json(response.success());
});

// this will run if none of the above matches
router.all((req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(204).end(); // 预检请求返回 204，避免 GET 触发错误
  }
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