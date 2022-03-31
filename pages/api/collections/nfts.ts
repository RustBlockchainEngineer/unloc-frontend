import { getWhitelisted } from '../../../integration/db'

import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse<string[]>) => {
  if (req.method === 'GET') {
    const data = await getWhitelisted()

    if (data === null) {
      res.status(404).end()
      return
    }

    res.status(200).json(data)
  } else {
    res.status(404).end()
  }
}

export default handler
