import React, { useContext, useEffect } from 'react'
import { observer } from 'mobx-react'

import { StoreContext } from '../../pages/_app'
import { OffersGridItem } from './offersGridItem'

export const OffersGrid = observer(() => {
  const store = useContext(StoreContext)
  const { offers } = store.Offers

  useEffect(() => {
    console.log(offers)
  }, [])
  return (
    <div className='offers-grid'>
      {offers.map((offer) => {
        const offerKey = offer.account.offer.toBase58()
        return <OffersGridItem key={offerKey} subOfferKey={offerKey} image={offer.nftMeta.arweaveMetadata.image} />
      })}
    </div>
  )
})
