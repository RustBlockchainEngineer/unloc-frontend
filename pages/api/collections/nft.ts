import type { NextApiRequest, NextApiResponse } from 'next'
import { getCollectionFromNft } from '@integration/db'

const handler = async (req: NextApiRequest, res: NextApiResponse<string | null>) => {
  if (req.method === 'POST') {
    const { id } = req.body

    if (!(id && typeof id === 'string')) {
      res.status(400).end()
      return
    }

    const data = await getCollectionFromNft(id)

    res.status(200).send(data)
  } else {
    res.status(404).end()
  }
}

export default handler
