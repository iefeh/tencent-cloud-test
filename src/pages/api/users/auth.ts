import type {NextApiRequest, NextApiResponse} from "next";
import {createRouter} from "next-connect";
import * as response from "@/lib/response/response";
import {mustAuthInterceptor, UserContextRequest} from "@/lib/middleware/auth";
import {genLoginJWT, getParticleUser} from "@/lib/particle.network/auth";


const router = createRouter<UserContextRequest, NextApiResponse>();

router.get(async (req, res) => {
    const data = await getParticleUser("4b2906e8-a403-46ce-bf35-a4899b4c450e", "3a081600-4fa5-49cd-8274-d252dea2523f");
    console.log(data);
    console.log(data.wallets);
    res.json(response.success({
        token: genLoginJWT("test_user_id")
    }));
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