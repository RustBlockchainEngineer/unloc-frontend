import Redis from 'ioredis'

const client = new Redis(process.env.REDIS_URL ? process.env.REDIS_URL : '')

export const getCollections = async (): Promise<string[]> => {
  return await client.hkeys('collections')
}

export const getCollectionFromNft = async (nft: string): Promise<string | null> => {
  const hash = await client.hgetall('collections')

  for (const key in hash) {
    const data = hash[key].split(',')

    if (data.includes(nft)) {
      return key
    }
  }

  return null
}

export const getWhitelisted = async (): Promise<string[]> => {
  return (await client.hvals('collections')).map((collection) => collection.split(',')).flat()
}
