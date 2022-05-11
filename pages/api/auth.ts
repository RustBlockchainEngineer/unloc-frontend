import type { NextApiRequest, NextApiResponse } from "next";
import { isUserWhitelisted } from "@integration/db";

const handler = async (req: NextApiRequest, res: NextApiResponse<{ isWhitelisted: boolean }>) => {
  if (req.method === "POST") {
    const isWhitelisted = await isUserWhitelisted(req.body.user);
    res.status(200).json({ isWhitelisted });
  } else {
    res.end(404);
  }
};

export default handler;
