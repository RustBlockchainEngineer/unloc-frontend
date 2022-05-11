import type { NextApiRequest, NextApiResponse } from "next";
import { ConfirmedSignatureInfo, PublicKey } from "@solana/web3.js";

import { getHistory } from "@integration/nftIntegration";

const handler = async (req: NextApiRequest, res: NextApiResponse<ConfirmedSignatureInfo[]>) => {
  if (req.method === "POST") {
    const limit = req.body.limit || 20;

    if (!req.body.address) {
      res.end(404);
      return;
    }

    const publicKey = new PublicKey(req.body.address);
    const history = await getHistory(publicKey, { limit: limit });

    res.status(200).send(history);
  } else {
    res.end(404);
  }
};

export default handler;
