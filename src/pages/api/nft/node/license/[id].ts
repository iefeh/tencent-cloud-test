import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { maybeAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import MuseNodeLicenseNFTMetadata from "@/lib/models/MuseNodeLicenseNFTMetadata";

const router = createRouter<UserContextRequest, NextApiResponse>();
let cachedMetadata: any
let lastRefreshTime: number = 0
router.use(maybeAuthInterceptor).get(async (req, res) => {
  const now = Date.now()
  if (now > lastRefreshTime + 60 * 1000) {
    const medatada = await MuseNodeLicenseNFTMetadata.findOne({ name: "Moonveil Muse Node License" }, { _id: 0 });
    lastRefreshTime = now;
    cachedMetadata = medatada;
  }

  return res.json(cachedMetadata);
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