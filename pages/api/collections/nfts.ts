import type { NextApiRequest, NextApiResponse } from "next";

import { getWhitelisted } from "@integration/db";

const handler = async (req: NextApiRequest, res: NextApiResponse<string[]>): Promise<void> => {
  if (req.method === "GET") {
    const data = await getWhitelisted();

    if (data === null) {
      res.status(404).end();
      return;
    }

    res.status(200).json(data);
  } else res.status(404).end();
};

// eslint-disable-next-line import/no-default-export
export default handler;
