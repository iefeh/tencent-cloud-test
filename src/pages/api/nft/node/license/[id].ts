import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { maybeAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
// import MuseNodeLicenseNFTMetadata from "@/lib/models/MuseNodeLicenseNFTMetadata";

const router = createRouter<UserContextRequest, NextApiResponse>();
// let cachedMetadata: any
// let lastRefreshTime: number = 0
router.get(async (req, res) => {
  // const now = Date.now()
  // if (now > lastRefreshTime + 60 * 1000) {
  //   const medatada = await MuseNodeLicenseNFTMetadata.findOne({ name: "Moonveil Muse Node License" }, { _id: 0 });
  //   lastRefreshTime = now;
  //   cachedMetadata = medatada;
  // }

  return res.json({
    "name": "Moonveil Muse Node License",
    "description": "Moonveil Muse Node will facilitate progressive decentralization, aligning with Polygon CDK’s tech updates. As L2s evolve to reduce centralization, the community’s readiness for tech stack upgrades ensures Moonveil remains at the forefront of L2 decentralization. Moonveil Muse Node will ultimately decentralize Data Availability (DA), as well as Proof Verification and Transaction Sequencing.",
    "animation_url": "https://d3dhz6pjw7pz9d.cloudfront.net/nft/node/animation.mp4",
    "attributes": [
      {
        "value": "Moonveil Muse Node License"
      }
    ]
  });
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