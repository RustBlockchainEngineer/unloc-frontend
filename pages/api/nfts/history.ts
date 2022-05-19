import { ConfirmedSignatureInfo, PublicKey } from "@solana/web3.js";
import type { NextApiRequest, NextApiResponse } from "next";

import { getHistory } from "@integration/nftIntegration";

export const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ConfirmedSignatureInfo[]>,
): Promise<void> => {
  if (req.method === "POST") {
    //TODO: interface needs to be implemented for req.body.limit
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const limit = (req.body.limit as number) || 20;

    //TODO: interface needs to be implemented for req.body.address
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!req.body.address) {
      res.end(404);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    const publicKey = new PublicKey(req.body.address);
    const history = await getHistory(publicKey, { limit });

    res.status(200).send(history);
  } else res.end(404);
};
