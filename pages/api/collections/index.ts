import type { NextApiRequest, NextApiResponse } from 'next'
import { getCollections } from '@integration/db'

const handler = async (req: NextApiRequest, res: NextApiResponse<string[]>) => {
  if (req.method === 'POST') {
    const data = await getCollections()
    res.status(200).json(data)
  } else {
    res.end(404)
  }
}

export default handler
