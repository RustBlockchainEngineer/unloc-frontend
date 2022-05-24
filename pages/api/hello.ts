// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

//TODO: What the purpose of this file
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const handler = (_req: NextApiRequest, res: NextApiResponse<Data>) => {
  res.status(200).json({ name: "John Doe" });
};
