import type { NextApiRequest, NextApiResponse } from "next";

import { getWhitelisted } from "@integration/db";

const handler = async (req: NextApiRequest, res: NextApiResponse<string[]>): Promise<void> => {
  if (req.method === "POST") {
    const data = await getWhitelisted();
    res.status(200).json(data);
  } else res.end(404);
};

// eslint-disable-next-line import/no-default-export
export default handler;
